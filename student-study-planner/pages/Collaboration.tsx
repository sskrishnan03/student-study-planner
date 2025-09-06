
import React from 'react';
import Card from '../components/Card';
import { UsersIcon } from '@heroicons/react/24/outline';

const Collaboration: React.FC = () => {
  return (
    <Card className="text-center">
      <UsersIcon className="h-16 w-16 mx-auto text-primary" />
      <h2 className="text-2xl font-semibold my-4">Collaboration Features Coming Soon</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Get ready to take your group projects to the next level! We're working on exciting collaboration tools that will allow you to:
      </p>
      <ul className="mt-4 text-left inline-block list-disc list-inside">
        <li>Share notes with classmates (with view/edit permissions).</li>
        <li>Create group study planners with integrated chat.</li>
        <li>Manage lab projects with shared progress boards.</li>
      </ul>
       <p className="mt-6 text-primary font-semibold">Stay tuned for updates!</p>
    </Card>
  );
};

export default Collaboration;
