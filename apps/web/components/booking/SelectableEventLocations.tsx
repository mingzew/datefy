import { useState } from "react";
import { z } from "zod";

import { getEventLocationType, locationKeyToString } from "@calcom/app-store/locations";
import { useLocale } from "@calcom/lib/hooks/useLocale";

import type { Props } from "./pages/AvailabilityPage";

const excludeNullValues = (value: unknown) => !!value;

export function SelectableEventLocations({
  locations,
  onLocationSelect,
}: {
  locations: Props["eventType"]["locations"];
  onLocationSelect: (index: number) => void;
}) {
  //create a state variable to keep track of the index of the div that is clicked
  const [selectedInd, setSelectedInd] = useState<number>(0);

  const { t } = useLocale();

  //create the onclick method for the div that takes in the index of the div
  const handleClick = (index: number) => {
    //if the index of the div is the same as the selected index, set the selected index to null
    if (index !== selectedInd) {
      //otherwise, set the selected index to the index of the div
      setSelectedInd(index);
      onLocationSelect(index);
    }
  };
  const renderLocations = locations.map((location, index) => {
    const eventLocationType = getEventLocationType(location.type);
    if (!eventLocationType) {
      // It's possible that the location app got uninstalled
      return null;
    }
    if (eventLocationType.variable === "hostDefault") {
      return null;
    }

    const translateAbleKeys = [
      "attendee_in_person",
      "in_person",
      "attendee_phone_number",
      "link_meeting",
      "organizer_phone_number",
    ];

    const locationKey = z.string().default("").parse(locationKeyToString(location));
    const translatedLocation = location.type.startsWith("integrations:")
      ? eventLocationType.label
      : translateAbleKeys.includes(locationKey)
      ? t(locationKey)
      : locationKey;

    return (
      //make the following div clickable and add a border and shadow around it when clicked. Pass the index of the div to the handleClick function
      <div
        key={`${location.type}-${index}`}
        className={`m-4 h-32 w-32 flex-shrink-0 cursor-pointer rounded-xl bg-gray-200 ${
          selectedInd === index ? "shadow-indigo-500/40 drop-shadow-lg" : "shadow"
        }`}
        onClick={() => handleClick(index)}>
        <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
      </div>
      //   <div key={`${location.type}-${index}`} className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
      //     <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
      //   </div>

      /* <div className="mt-8 flex h-full w-full rounded-md px-4 text-center sm:mt-0 sm:p-4 md:-mb-5">
<div className="scroll-bar relative mb-4 flex overflow-x-auto md:w-[986px]">
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-cover" src="/default-event-banner.png" alt="image" />
  </div>
  <div className="flex items-center">
    <div className="h-24 w-0.5 bg-gradient-to-t from-transparent via-gray-200 to-transparent" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-fill" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-cover" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div
    className={`m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300 cursor-pointer ${
      isSelected ? 'shadow-lg border-yellow-400' : 'shadow'
    } ${isSelected ? 'animate-pulse' : ''}`}
    onClick={handleClick}
  >
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
  <div className="m-4 h-32 w-32 flex-shrink-0 rounded-xl bg-cyan-300">
    <img className="object-contain" src="/default-event-banner-sq.png" alt="image" />
  </div>
</div>
</div> */

      //   <div key={`${location.type}-${index}`} className="flex flex-row items-center text-sm font-medium">
      //     {eventLocationType.iconUrl === "/link.svg" ? (
      //       <Link className="text-default ml-[2px] h-4 w-4  ltr:mr-[10px] rtl:ml-[10px] " />
      //     ) : (
      //       <img
      //         src={eventLocationType.iconUrl}
      //         className={classNames(
      //           "ml-[2px] h-4 w-4 opacity-70 ltr:mr-[10px] rtl:ml-[10px] dark:opacity-100 ",
      //           !eventLocationType.iconUrl?.startsWith("/app-store") ? "dark:invert-[.65]" : ""
      //         )}
      //         alt={`${eventLocationType.label} icon`}
      //       />
      //     )}
      //     <Tooltip content={translatedLocation}>
      //       <p className="line-clamp-1">{translatedLocation}</p>
      //     </Tooltip>
      //   </div>
    );
  });

  const filteredLocations = renderLocations.filter(excludeNullValues) as JSX.Element[];
  return filteredLocations.length ? (
    <div className="mt-8 flex w-full rounded-md px-4 text-center sm:mt-0 sm:p-4 md:-mb-5">
      <div className="scroll-bar relative mb-4 flex overflow-x-auto md:w-[986px]">{filteredLocations}</div>
    </div>
  ) : null;
}
