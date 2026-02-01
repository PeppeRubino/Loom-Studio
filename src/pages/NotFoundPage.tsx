import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const NotFoundPage = () => {
  return (
    <EmptyState
      title="404"
      description="We could not find that page."
      action={
        <Link to="/">
          <Button variant="secondary">Go to home</Button>
        </Link>
      }
    />
  );
};

