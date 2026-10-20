import { Component, type ReactNode } from 'react';

/** Never leave someone on a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container" style={{ padding: '64px 16px' }}>
        <div className="empty">
          <h2>Something went wrong on this page</h2>
          <p>Your journal is still saved in this browser. Going back to Insights usually fixes it.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.location.hash = '#/insights';
              window.location.reload();
            }}
          >
            Back to Insights
          </button>
        </div>
      </div>
    );
  }
}
