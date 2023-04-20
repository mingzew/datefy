import { NewScheduleButton } from "@calcom/features/schedules";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { EmptyScreen, HeadSeo } from "@calcom/ui";
import { Users } from "@calcom/ui/components/icon";

import PageWrapper from "@components/PageWrapper";

const CreateFirstBuddyView = () => {
  const { t } = useLocale();

  return (
    <EmptyScreen Icon={Users} headline={t("new_buddy_heading")} description={t("new_buddy_description")} />
  );
};

const BuddyPage = () => {
  const { t } = useLocale();

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

BuddyPage.PageWrapper = PageWrapper;

export default BuddyPage;
