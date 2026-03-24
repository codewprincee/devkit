'use client';

import { useState } from 'react';
import { AppSidebar, type ToolId } from './AppSidebar';
import { ErrorBoundary } from './ErrorBoundary';
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
          <ErrorBoundary toolName="PortMan">
            <PortManApp active={activeTool === 'portman'} />
          </ErrorBoundary>
        </div>
        <div className={activeTool === 'envguard' ? 'h-full' : 'hidden'}>
          <ErrorBoundary toolName="EnvGuard">
            <EnvGuardApp />
          </ErrorBoundary>
        </div>
        <div className={activeTool === 'apipad' ? 'h-full' : 'hidden'}>
          <ErrorBoundary toolName="API Pad">
            <ApiPadApp />
          </ErrorBoundary>
        </div>
        <div className={activeTool === 'loglens' ? 'h-full' : 'hidden'}>
          <ErrorBoundary toolName="LogLens">
            <LogLensApp />
          </ErrorBoundary>
        </div>
        <div className={activeTool === 'devdash' ? 'h-full' : 'hidden'}>
          <ErrorBoundary toolName="DevDash">
            <DevDashApp />
          </ErrorBoundary>
        </div>
      </main>
    </>
  );
}
