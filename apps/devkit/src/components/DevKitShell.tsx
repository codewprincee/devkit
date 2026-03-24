'use client';

import { useState } from 'react';
import { AppSidebar, type ToolId } from './AppSidebar';
import { PortManApp } from './portman/PortManApp';
import EnvGuardApp from './envguard/EnvGuardApp';
import ApiPadApp from './apipad/ApiPadApp';
import LogLensApp from './loglens/LogLensApp';
import DevDashApp from './devdash/DevDashApp';

export function DevKitShell() {
  const [activeTool, setActiveTool] = useState<ToolId>('portman');

  return (
    <>
      <AppSidebar activeTool={activeTool} onChangeTool={setActiveTool} />
      <main className="flex-1 overflow-hidden">
        <div className={activeTool === 'portman' ? 'h-full' : 'hidden'}>
          <PortManApp active={activeTool === 'portman'} />
        </div>
        <div className={activeTool === 'envguard' ? 'h-full' : 'hidden'}>
          <EnvGuardApp />
        </div>
        <div className={activeTool === 'apipad' ? 'h-full' : 'hidden'}>
          <ApiPadApp />
        </div>
        <div className={activeTool === 'loglens' ? 'h-full' : 'hidden'}>
          <LogLensApp />
        </div>
        <div className={activeTool === 'devdash' ? 'h-full' : 'hidden'}>
          <DevDashApp />
        </div>
      </main>
    </>
  );
}
