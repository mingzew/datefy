import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useMemo, useReducer, useState } from "react";
import { z } from "zod";

import BookingPageTagManager from "@calcom/app-store/BookingPageTagManager";
import { getEventTypeAppData } from "@calcom/app-store/utils";
import dayjs from "@calcom/dayjs";
import {
  useEmbedNonStylesConfig,
  useEmbedStyles,
  useEmbedUiConfig,
  useIsBackgroundTransparent,
  useIsEmbed,
} from "@calcom/embed-core/embed-iframe";
import classNames from "@calcom/lib/classNames";
import useGetBrandingColours from "@calcom/lib/getBrandColours";
import getPaymentAppData from "@calcom/lib/getPaymentAppData";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import notEmpty from "@calcom/lib/notEmpty";
import { detectBrowserTimeFormat, setIs24hClockInLocalStorage, TimeFormat } from "@calcom/lib/timeFormat";
import { SchedulingType } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc";
import { HeadSeo, useCalcomTheme } from "@calcom/ui";

import { timeZone as localStorageTimeZone } from "@lib/clock";

import type { Gate, GateState } from "@components/Gates";
import Gates from "@components/Gates";
import { AvailableEventLocations } from "@components/booking/AvailableEventLocations";
import { SelectableEventLocations } from "@components/booking/SelectableEventLocations";
import { SlotPicker } from "@components/booking/SlotPicker";
import { UserAvatars } from "@components/booking/UserAvatars";

import type { AvailabilityPageProps } from "../../../pages/[user]/[type]";
import type { DynamicAvailabilityPageProps } from "../../../pages/d/[link]/[slug]";
import type { AvailabilityTeamPageProps } from "../../../pages/team/[slug]/[type]";

const PoweredBy = dynamic(() => import("@calcom/ee/components/PoweredBy"));

const Toaster = dynamic(() => import("react-hot-toast").then((mod) => mod.Toaster), { ssr: false });
/*const SlotPicker = dynamic(() => import("../SlotPicker").then((mod) => mod.SlotPicker), {
  ssr: false,
  loading: () => <div className="mt-8 px-4 pb-4 sm:mt-0 sm:p-4 md:min-w-[300px] md:px-5 lg:min-w-[455px]" />,
});*/
const TimezoneDropdown = dynamic(() => import("../TimezoneDropdown").then((mod) => mod.TimezoneDropdown), {
  ssr: false,
});

const dateQuerySchema = z.object({
  rescheduleUid: z.string().optional().default(""),
  date: z.string().optional().default(""),
  timeZone: z.string().optional().default(""),
  seatReferenceUid: z.string().optional(),
});

export type Props = AvailabilityTeamPageProps | AvailabilityPageProps | DynamicAvailabilityPageProps;

const useBrandColors = ({ brandColor, darkBrandColor }: { brandColor: string; darkBrandColor: string }) => {
  const brandTheme = useGetBrandingColours({
    lightVal: brandColor,
    darkVal: darkBrandColor,
  });
  useCalcomTheme(brandTheme);
};

const AvailabilityPage = ({ profile, eventType, favoriteActivites, ...restProps }: Props) => {
  const router = useRouter();
  const isEmbed = useIsEmbed(restProps.isEmbed);
  const query = dateQuerySchema.parse(router.query);
  const { rescheduleUid } = query;
  useTheme(profile.theme);
  useBrandColors({
    brandColor: profile.brandColor,
    darkBrandColor: profile.darkBrandColor,
  });
  const { t, i18n } = useLocale();
  const availabilityDatePickerEmbedStyles = useEmbedStyles("availabilityDatePicker");
  //TODO: Plan to remove shouldAlignCentrallyInEmbed config
  const shouldAlignCentrallyInEmbed = useEmbedNonStylesConfig("align") !== "left";
  const shouldAlignCentrally = !isEmbed || shouldAlignCentrallyInEmbed;
  const isBackgroundTransparent = useIsBackgroundTransparent();

  const [timeZone, setTimeZone] = useState<string>();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(detectBrowserTimeFormat);

  const [selectedLocationInd, setSelectedLocationInd] = useState(0);

  const onTimeFormatChange = (is24Hours: boolean) => {
    setTimeFormat(is24Hours ? TimeFormat.TWENTY_FOUR_HOUR : TimeFormat.TWELVE_HOUR);
    setIs24hClockInLocalStorage(is24Hours);
  };

  const [gateState, gateDispatcher] = useReducer(
    (state: GateState, newState: Partial<GateState>) => ({
      ...state,
      ...newState,
    }),
    {}
  );

  useEffect(() => {
    setTimeZone(localStorageTimeZone() || dayjs.tz.guess());
  }, []);

  const [recurringEventCount, setRecurringEventCount] = useState(eventType.recurringEvent?.count);

  /*
  const telemetry = useTelemetry();
   useEffect(() => {
    if (top !== window) {
      //page_view will be collected automatically by _middleware.ts
      telemetry.event(
        telemetryEventTypes.embedView,
        collectPageParameters("/availability", { isTeamBooking: document.URL.includes("team/") })
      );
    }
  }, [telemetry]); */
  const embedUiConfig = useEmbedUiConfig();
  // get dynamic user list here
  const userList = eventType.users ? eventType.users.map((user) => user.username).filter(notEmpty) : [];

  const timezoneDropdown = useMemo(
    () => <TimezoneDropdown timeZone={timeZone} onChangeTimeZone={setTimeZone} />,
    [timeZone]
  );
  const paymentAppData = getPaymentAppData(eventType);

  const rainbowAppData = getEventTypeAppData(eventType, "rainbow") || {};
  const rawSlug = profile.slug ? profile.slug.split("/") : [];
  if (rawSlug.length > 1) rawSlug.pop(); //team events have team name as slug, but user events have [user]/[type] as slug.

  const showEventTypeDetails = (isEmbed && !embedUiConfig.hideEventTypeDetails) || !isEmbed;

  // Define conditional gates here
  const gates = [
    // Rainbow gate is only added if the event has both a `blockchainId` and a `smartContractAddress`
    rainbowAppData && rainbowAppData.blockchainId && rainbowAppData.smartContractAddress
      ? ("rainbow" as Gate)
      : undefined,
  ];

  const { data: bookingAttendees } = trpc.viewer.bookings.getBookingAttendees.useQuery(
    {
      seatReferenceUid: rescheduleUid,
    },
    {
      enabled: !!(rescheduleUid && eventType.seatsPerTimeSlot),
    }
  );

  const handleLocationSelect = (index: number) => {
    console.log("Selected location index:", index);
    setSelectedLocationInd(index);
  };

  return (
    <Gates gates={gates} appData={rainbowAppData} dispatch={gateDispatcher}>
      <HeadSeo
        title={`${rescheduleUid ? t("reschedule") : ""} ${eventType.title} | ${profile.name}`}
        description={`${rescheduleUid ? t("reschedule") : ""} ${eventType.title}`}
        meeting={{
          title: eventType.title,
          profile: { name: `${profile.name}`, image: profile.image },
          users: [
            ...(eventType.users || []).map((user) => ({
              name: `${user.name}`,
              username: `${user.username}`,
            })),
          ],
        }}
        nextSeoProps={{
          nofollow: eventType.hidden,
          noindex: eventType.hidden,
        }}
        isBrandingHidden={restProps.isBrandingHidden}
      />
      <BookingPageTagManager eventType={eventType} />
      <div>
        <main
          className={classNames(
            "flex-col md:mx-4 md:flex lg:flex",
            shouldAlignCentrally ? "items-center" : "items-start",
            !isEmbed && classNames("bg-subtle dark:bg-default mx-auto my-0 ease-in-out md:my-12")
          )}>
          <div>
            <div>
              {/* profile and name */}
              <div
                className={classNames(
                  "flex flex-row p-5",
                  "min-w-full space-x-5 md:w-[230px] md:min-w-[230px]",
                  recurringEventCount && "xl:w-[380px] xl:min-w-[380px]"
                )}>
                <UserAvatars
                  profile={profile}
                  users={eventType.users}
                  showMembers={eventType.schedulingType !== SchedulingType.ROUND_ROBIN}
                  size="sm"
                  truncateAfter={3}
                />
                <h2 className="text-default mt-1 mb-2 break-words text-lg font-medium ">{profile.name}</h2>
              </div>

              {/* create an event banner with a picture */}
              <div className="relative">
                <div
                  className={classNames(
                    isBackgroundTransparent
                      ? ""
                      : "dark:bg-muted h-64 bg-cover bg-center bg-no-repeat pb-4 md:pb-0"
                  )}
                  style={{
                    backgroundImage: 'url("/default-event-banner.png")',
                    backgroundColor: "#F4F0EA",
                  }}>
                  <div
                    className={classNames(
                      " border-subtle flex flex-col p-5",
                      "min-w-full space-x-5 space-y-5 md:w-[230px] md:min-w-[230px]",
                      recurringEventCount && "xl:w-[380px] xl:min-w-[380px]"
                    )}>
                    <h1 className="font-cal text-emphasis mb-6 break-words text-2xl font-semibold leading-none">
                      {eventType.title}
                    </h1>
                    <div className={classNames("text-default absolute bottom-5 left-0 mb-4 mr-4")}>
                      <AvailableEventLocations
                        selectedInd={selectedLocationInd}
                        locations={eventType.locations as AvailabilityPageProps["eventType"]["locations"]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* create a section where user can select one of the location options that goes from left to right.
             Each location option should have a background image and a title.
             The user can select one of the location options and it will be highlighted.
             Make the locations options scrollable from left to right */}
              <div className="flex max-w-[986px] flex-col md:max-w-[986px] md:flex-row">
                <div className="flex flex-col md:max-w-[550px]">
                  <div className="mobile-full-width">
                    <SelectableEventLocations
                      locations={eventType.locations as AvailabilityPageProps["eventType"]["locations"]}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>

                  <div
                    style={availabilityDatePickerEmbedStyles}
                    className={classNames(
                      isBackgroundTransparent ? "" : "bg-default dark:bg-muted flex flex-col pb-4 md:pb-0",
                      "border-booker md:border-booker-width mobile-full-width md:rounded-md",
                      isEmbed && "mx-auto"
                    )}>
                    <div>
                      {showEventTypeDetails && (
                        <div
                          className={classNames(
                            " border-subtle flex flex-col p-5 sm:border-r",
                            "min-w-full md:w-1/2 md:min-w-[230px]",
                            recurringEventCount && "xl:w-[380px] xl:min-w-[380px]"
                          )}>
                          {timezoneDropdown}
                          <div>{eventType.locations[selectedLocationInd].description ?? ""}</div>
                          {/* Temporarily disabled - booking?.startTime && rescheduleUid && (
                    <div>
                      <p
                        className="mt-4 mb-3 text-default"
                        data-testid="former_time_p_desktop">
                        {t("former_time")}
                      </p>
                      <p className="text-subtle line-through ">
                        <CalendarIcon className="ltr:mr-[10px] rtl:ml-[10px] -mt-1 inline-block h-4 w-4 text-subtle" />
                        {typeof booking.startTime === "string" && parseDate(dayjs(booking.startTime), i18n)}
                      </p>
                    </div>
                  )*/}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <SlotPicker
                  weekStart={
                    typeof profile.weekStart === "string"
                      ? ([
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ].indexOf(profile.weekStart) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
                      : profile.weekStart /* Allows providing weekStart as number */
                  }
                  eventType={eventType}
                  timeFormat={timeFormat}
                  onTimeFormatChange={onTimeFormatChange}
                  timeZone={timeZone}
                  users={userList}
                  seatsPerTimeSlot={eventType.seatsPerTimeSlot || undefined}
                  bookingAttendees={bookingAttendees || undefined}
                  recurringEventCount={recurringEventCount}
                  ethSignature={gateState.rainbowToken}
                />
              </div>
            </div>
            {/* FIXME: We don't show branding in Embed yet because we need to place branding on top of the main content. Keeping it outside the main content would have visibility issues because outside main content background is transparent */}
            {!restProps.isBrandingHidden && !isEmbed && <PoweredBy />}
          </div>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </Gates>
  );
};

export default AvailabilityPage;
