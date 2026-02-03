import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { SalesRoutingList, CreateRoutingWizard } from './components/sales-routing';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirect root to sales routing */}
          <Route path="/" element={<Navigate to="/products/sales-routing" replace />} />
          
          {/* Sales Routing Routes */}
          <Route path="/products/sales-routing" element={<SalesRoutingList />} />
          <Route path="/products/sales-routing/create" element={<CreateRoutingWizard />} />
          <Route path="/products/sales-routing/edit/:id" element={<CreateRoutingWizard />} />
          
          {/* Placeholder for other routes */}
          <Route path="/products/catalog-integration" element={
            <PlaceholderPage title="Catalog Integration" description="Manage warehouse connections and product catalogs" />
          } />
          
          {/* Catch all - redirect to sales routing */}
          <Route path="*" element={<Navigate to="/products/sales-routing" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// Simple placeholder component for unimplemented pages
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto',
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: '8px',
          color: '#212529'
        }}>
          {title}
        </h1>
        <p style={{ 
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          {description}
        </p>
        <p style={{ 
          color: '#adb5bd',
          fontSize: '13px',
          marginTop: '24px'
        }}>
          This page is not part of the mockup scope
        </p>
      </div>
    </div>
  );
}

export default App;
