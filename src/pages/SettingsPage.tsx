import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Core preferences for the wardrobe tracker." />
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#111111]">Workspace density</p>
          <p className="text-sm text-[#5e5e5e]">
            Comfort density is enabled by default. Adjust the layout density when you are working on smaller screens.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="secondary">Change density</Button>
            <span className="text-xs uppercase tracking-[0.4em] text-[#7a7a7a]">Comfort</span>
          </div>
        </div>
      </Card>
      <Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#111111]">Automation & sync</p>
          <p className="text-sm text-[#5e5e5e]">
            Placeholder for future Google login, inventory sync, and status chips for runtime indicators.
          </p>
          <Button variant="ghost">Review sync plan</Button>
        </div>
      </Card>
    </div>
  );
};

