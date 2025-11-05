import { Outlet } from 'react-router-dom';

export function FullscreenLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}
