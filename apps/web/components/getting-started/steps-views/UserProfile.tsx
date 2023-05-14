import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { md } from "@calcom/lib/markdownIt";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import turndown from "@calcom/lib/turndownService";
import { trpc } from "@calcom/trpc/react";
import { Button, Editor, ImageUploader, Label, showToast } from "@calcom/ui";
import { Avatar } from "@calcom/ui";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

type FormData = {
  bio: string;
};
interface IUserProfileProps {
  user: IOnboardingPageProps["user"];
}

const UserProfile = (props: IUserProfileProps) => {
  const { user } = props;
  const { t } = useLocale();
  const avatarRef = useRef<HTMLInputElement>(null!);
  const { setValue, handleSubmit, getValues } = useForm<FormData>({
    defaultValues: { bio: user?.bio || "" },
  });

  const { data: eventTypes } = trpc.viewer.eventTypes.list.useQuery();
  const [imageSrc, setImageSrc] = useState<string>(user?.avatar || "");
  const utils = trpc.useContext();
  const router = useRouter();
  const createEventType = trpc.viewer.eventTypes.create.useMutation();
  const telemetry = useTelemetry();
  const [firstRender, setFirstRender] = useState(true);

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async (_data, context) => {
      if (context.avatar) {
        showToast(t("your_user_profile_updated_successfully"), "success");
        await utils.viewer.me.refetch();
      } else {
        try {
          if (eventTypes?.length === 0) {
            await Promise.all(
              DEFAULT_EVENT_TYPES.map(async (event) => {
                return createEventType.mutate(event);
              })
            );
          }
        } catch (error) {
          console.error(error);
        }

        await utils.viewer.me.refetch();
        router.push("/");
      }
    },
    onError: () => {
      showToast(t("problem_saving_user_profile"), "error");
    },
  });
  const onSubmit = handleSubmit((data: { bio: string }) => {
    const { bio } = data;

    telemetry.event(telemetryEventTypes.onboardingFinished);

    mutation.mutate({
      bio,
      completedOnboarding: true,
    });
  });

  async function updateProfileHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredAvatar = avatarRef.current.value;
    mutation.mutate({
      avatar: enteredAvatar,
    });
  }

  const DEFAULT_BOOKING_FIELDS = [
    {
      name: "name",
      defaultLabel: "your_name",
      type: "name",
      required: true,
      editable: "system",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
    {
      name: "email",
      defaultLabel: "email_address",
      type: "email",
      required: true,
      editable: "system",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
    {
      name: "location",
      defaultLabel: "location",
      type: "radioInput",
      getOptionsAt: "locations",
      optionsInputs: {
        phone: {
          type: "phone",
          required: true,
          placeholder: "",
        },
        attendeeInPerson: {
          type: "address",
          required: true,
          placeholder: "",
        },
      },
      hideWhenJustOneOption: true,
      required: false,
      editable: "system",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
    {
      name: "location",
      label: "location",
      placeholder: "Suggest location that works for you if the one shown doesn't",
      type: "textarea",
      required: false,
      editable: "user",
      sources: [
        {
          id: "user",
          type: "user",
          label: "User",
          fieldRequired: false,
        },
      ],
    },
    {
      name: "notes",
      defaultLabel: "additional_notes",
      defaultPlaceholder: "share_additional_notes",
      type: "textarea",
      required: false,
      editable: "system-but-optional",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
    {
      name: "guests",
      defaultLabel: "additional_guests",
      type: "multiemail",
      required: false,
      hidden: false,
      editable: "system-but-optional",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
    {
      name: "rescheduleReason",
      defaultLabel: "reschedule_reason",
      defaultPlaceholder: "reschedule_placeholder",
      views: [
        {
          label: "Reschedule View",
          id: "reschedule",
        },
      ],
      type: "textarea",
      required: false,
      editable: "system-but-optional",
      sources: [
        {
          id: "default",
          type: "default",
          label: "Default",
        },
      ],
    },
  ];

  const DEFAULT_EVENT_TYPES = [
    {
      title: "Food & Drinks",
      slug: "food-and-drinks",
      description: "Let's meet to grab a bite and a drink",
      length: 60,
      slotInterval: 30,
      minimumBookingNotice: 720,
      disableGuests: true,
      locations: [
        {
          type: "inPerson",
          address: "TBD",
          displayLocationPublicly: true,
        },
      ],
      bookingFields: DEFAULT_BOOKING_FIELDS,
    },
    {
      title: "Casual date",
      slug: "casual-date",
      description: "Coffee or boba",
      length: 30,
      slotInterval: 30,
      minimumBookingNotice: 720,
      disableGuests: true,
      locations: [
        {
          type: "inPerson",
          address: "TBD",
          displayLocationPublicly: true,
        },
      ],
      bookingFields: DEFAULT_BOOKING_FIELDS,
    },
    {
      title: "Friend Date",
      slug: "friend-date",
      description: "Coffee or boba",
      length: 30,
      slotInterval: 30,
      minimumBookingNotice: 720,
      disableGuests: true,
      locations: [
        {
          type: "inPerson",
          address: "TBD",
          displayLocationPublicly: true,
        },
      ],
      bookingFields: DEFAULT_BOOKING_FIELDS,
    },
    {
      title: "Hangout",
      slug: "hangout",
      description: "Low key hangout session",
      length: 30,
      slotInterval: 15,
      minimumBookingNotice: 720,
      metadata: {
        multipleDuration: [30, 60, 90, 120],
      },
      hidden: true,
    },
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-row items-center justify-start rtl:justify-end">
        {user && (
          <Avatar
            alt={user.username || "user avatar"}
            gravatarFallbackMd5={user.emailMd5}
            size="lg"
            imageSrc={imageSrc}
          />
        )}
        <input
          ref={avatarRef}
          type="hidden"
          name="avatar"
          id="avatar"
          placeholder="URL"
          className="border-default focus:ring-empthasis mt-1 block w-full rounded-sm border px-3 py-2 text-sm focus:border-gray-800 focus:outline-none"
          defaultValue={imageSrc}
        />
        <div className="flex items-center px-4">
          <ImageUploader
            target="avatar"
            id="avatar-upload"
            buttonMsg={t("add_profile_photo")}
            handleAvatarChange={(newAvatar) => {
              avatarRef.current.value = newAvatar;
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              )?.set;
              nativeInputValueSetter?.call(avatarRef.current, newAvatar);
              const ev2 = new Event("input", { bubbles: true });
              avatarRef.current.dispatchEvent(ev2);
              updateProfileHandler(ev2 as unknown as FormEvent<HTMLFormElement>);
              setImageSrc(newAvatar);
            }}
            imageSrc={imageSrc}
          />
        </div>
      </div>
      <fieldset className="mt-8">
        <Label className="text-default mb-2 block text-sm font-medium">{t("about")}</Label>
        <Editor
          getText={() => md.render(getValues("bio") || user?.bio || "")}
          setText={(value: string) => setValue("bio", turndown(value))}
          excludedToolbarItems={["blockType"]}
          firstRender={firstRender}
          setFirstRender={setFirstRender}
        />
        <p className="dark:text-inverted text-default mt-2 font-sans text-sm font-normal">
          {t("few_sentences_about_yourself")}
        </p>
      </fieldset>
      <Button
        type="submit"
        className="text-inverted mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm">
        {t("finish")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </form>
  );
};

export default UserProfile;
