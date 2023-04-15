import { useRouter } from "next/router";

import { NewScheduleButton } from "@calcom/features/schedules";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useMediaQuery from "@calcom/lib/hooks/useMediaQuery";
import { EmptyScreen, HeadSeo } from "@calcom/ui";
import { FiUsers } from "@calcom/ui/components/icon";

const CreateFirstBuddyView = () => {
  const { t } = useLocale();

  return (
    <EmptyScreen Icon={FiUsers} headline={t("new_buddy_heading")} description={t("new_buddy_description")} />
  );
};

const BuddyPage = () => {
  const { t } = useLocale();
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div>
      <HeadSeo
        title="Buddy"
        description="Invite a friend/family. They can see your itenaries and live location during your outtings."
      />
      <Shell
        withoutSeo
        heading={t("buddy_page_title")}
        subtitle={t("buddy_page_subtitle")}
        CTA={<NewScheduleButton />}>
        <CreateFirstBuddyView />
      </Shell>
    </div>
  );
};

export default BuddyPage;
