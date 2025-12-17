import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Render immediately with a simple component
const root = createRoot(rootElement)
root.render(
  <div style={{ 
    padding: '40px', 
    textAlign: 'center', 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999
  }}>
    <h1 style={{ color: '#ed3d66', fontSize: '32px', marginBottom: '20px' }}>
      Chargement...
    </h1>
    <p style={{ color: '#0F172A', fontSize: '18px' }}>
      Initialisation de l'application
    </p>
  </div>
)

// Then try to load the real app
setTimeout(async () => {
  try {
    const { default: App } = await import('./App.tsx')
    const { AuthProvider } = await import('./context/AuthContext')
    
    // Error boundary component
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>
      } catch (error) {
        console.error('Error in component:', error)
        return (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            fontFamily: 'sans-serif',
            backgroundColor: '#FAFAFA',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <h1 style={{ color: '#dc2626', fontSize: '32px', marginBottom: '20px' }}>
              Erreur dans le composant
            </h1>
            <p style={{ color: '#0F172A', fontSize: '18px' }}>
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )
      }
    }
    
    root.render(
  <StrictMode>
        <ErrorBoundary>
      <AuthProvider>
            <ErrorBoundary>
        <App />
            </ErrorBoundary>
      </AuthProvider>
        </ErrorBoundary>
      </StrictMode>
    )
  } catch (error) {
    console.error('Failed to load app:', error)
    root.render(
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        fontFamily: 'sans-serif',
        backgroundColor: '#FAFAFA',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{ color: '#dc2626', fontSize: '32px', marginBottom: '20px' }}>
          Erreur de chargement
        </h1>
        <p style={{ color: '#0F172A', fontSize: '18px', marginBottom: '20px' }}>
          Impossible de charger l'application.
        </p>
        <pre style={{ 
          marginTop: '20px', 
          textAlign: 'left', 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px', 
          color: '#0F172A', 
          overflowX: 'auto', 
          maxWidth: '800px',
          fontSize: '12px'
        }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <p style={{ marginTop: '20px', color: '#64748B' }}>
          Vérifiez la console du navigateur (F12) pour plus de détails.
        </p>
      </div>
    )
  }
}, 100)
