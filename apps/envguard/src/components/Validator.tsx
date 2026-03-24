'use client';

import { useMemo } from 'react';
import type { EnvFile } from '@/types';
import { validateVariables } from '@/lib/validator';

interface ValidatorProps {
  files: EnvFile[];
  selectedFile: string | null;
}

export function Validator({ files, selectedFile }: ValidatorProps) {
  const currentFile = files.find((f) => f.path === selectedFile);
  const exampleFile = files.find(
    (f) => f.name === '.env.example' || f.name === '.env.sample'
  );

  const report = useMemo(() => {
    if (!currentFile) return null;
    return validateVariables(currentFile.variables, exampleFile?.variables);
  }, [currentFile, exampleFile]);

  if (!currentFile) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            Select a file from the sidebar to validate
          </p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3">
          {report.passed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {report.passed ? 'Validation Passed' : 'Issues Found'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Validating <span className="font-mono">{currentFile.name}</span>
              {exampleFile && (
                <span> against <span className="font-mono">{exampleFile.name}</span></span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${report.errors > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
            {report.errors} error{report.errors !== 1 ? 's' : ''}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${report.warnings > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {report.warnings} warning{report.warnings !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            {currentFile.variables.length} variable{currentFile.variables.length !== 1 ? 's' : ''} checked
          </span>
        </div>
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-auto">
        {report.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">All checks passed</p>
            <p className="mt-1 text-xs text-gray-500">
              No issues found in {currentFile.name}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {report.issues.map((issue, idx) => (
              <li
                key={`${issue.key}-${idx}`}
                className={`flex items-start gap-3 px-4 sm:px-6 py-3 ${
                  issue.severity === 'error' ? 'bg-red-50/30' : 'bg-amber-50/30'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {issue.severity === 'error' ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
                      <svg className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-900">
                      {issue.key}
                    </span>
                    {issue.line > 0 && (
                      <span className="text-[10px] text-gray-400">
                        line {issue.line}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        issue.severity === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">{issue.message}</p>
                  {issue.value && (
                    <p className="mt-1 font-mono text-[10px] text-gray-400 truncate max-w-md">
                      Current value: {issue.value}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
