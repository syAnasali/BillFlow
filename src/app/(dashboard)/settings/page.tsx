import { BusinessProfileForm } from "@/features/settings/components/business-profile-form";
import { getBusinessProfile } from "@/features/settings/server/queries";

/**
 * Protected settings screen for business profile management.
 */
export default async function SettingsPage() {
  const profile = await getBusinessProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your invoice business details.
        </p>
      </div>
      <BusinessProfileForm profile={profile} />
    </div>
  );
}
