import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { SalesRoutingList, CreateRoutingWizard, EditRouting } from './components/sales-routing';
import { CatalogIntegrationPage, CreateIntegrationWizard } from './components/catalog-integration';
import { ChannelsPage } from './components/channels';
import { DemoProvider } from './context/DemoContext';
import './styles/global.css';

function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
          {/* Redirect root to sales routing */}
          <Route path="/" element={<Navigate to="/products/sales-routing" replace />} />
          
          {/* Sales Routing Routes */}
          <Route path="/products/sales-routing" element={<SalesRoutingList />} />
          <Route path="/products/sales-routing/create" element={<CreateRoutingWizard />} />
          <Route path="/products/sales-routing/edit/:id" element={<EditRouting />} />
          
          {/* Catalog Integration Routes */}
          <Route path="/products/catalog-integration" element={<CatalogIntegrationPage />} />
          <Route path="/products/catalog-integration/create" element={<CreateIntegrationWizard />} />
          
          {/* Channels Routes */}
          <Route path="/products/channels" element={<ChannelsPage />} />
          
          {/* Catch all - redirect to sales routing */}
          <Route path="*" element={<Navigate to="/products/sales-routing" replace />} />
        </Routes>
        </Layout>
      </BrowserRouter>
    </DemoProvider>
  );
}

export default App;
