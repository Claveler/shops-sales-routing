import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faStore, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../common/Table';
import { Breadcrumb } from '../common/Breadcrumb';
import { SalesRoutingEmptyState } from './SalesRoutingEmptyState';
import { useDemo } from '../../context/DemoContext';
import { getEventById, getWarehouseById, getBoxOfficeSetupsByRoutingId } from '../../data/mockData';
import type { RoutingStatus, RoutingType } from '../../data/mockData';
import styles from './SalesRoutingList.module.css';

const statusVariantMap: Record<RoutingStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary'
};

const typeConfig: Record<RoutingType, { icon: typeof faStore; label: string }> = {
  onsite: { icon: faStore, label: 'Onsite' },
  online: { icon: faGlobe, label: 'Online' }
};

export function SalesRoutingList() {
  const navigate = useNavigate();
  const demo = useDemo();
  const salesRoutings = demo.getSalesRoutings();
  const demoWarehouses = demo.getWarehouses();
  const integration = demo.getIntegration();

  // Helper to get warehouse by ID - use demo context first, then static data
  const getWarehouse = (id: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === id);
    return demoWarehouse || getWarehouseById(id);
  };

  const handleCreateNew = () => {
    navigate('/products/sales-routing/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/products/sales-routing/edit/${id}`);
  };

  const handleGoToIntegration = () => {
    navigate('/products/catalog-integration');
  };

  // Show empty state if no routings
  if (salesRoutings.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumb 
          items={[
            { label: 'Products', path: '/products' },
            { label: 'Sales routing' }
          ]} 
        />
        
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Sales routing</h1>
        </div>

        <SalesRoutingEmptyState 
          hasIntegration={!!integration}
          onCreateNew={handleCreateNew}
          onGoToIntegration={handleGoToIntegration}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sales routing</h1>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          <CardHeader 
            actions={
              <Button 
                variant="primary" 
                icon={faPlus}
                onClick={handleCreateNew}
              >
                Create new sales routing
              </Button>
            }
          >
            <CardTitle subtitle="Configure product availability for events">
              Sales Routings
            </CardTitle>
          </CardHeader>

          <CardBody>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Name</TableCell>
                  <TableCell header>Type</TableCell>
                  <TableCell header>Event</TableCell>
                  <TableCell header>Warehouse(s)</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesRoutings.map((routing) => {
                  const event = getEventById(routing.eventId);
                  const warehouses = routing.warehouseIds.map(id => getWarehouse(id)).filter(Boolean);
                  const typeInfo = typeConfig[routing.type];
                  const boxOfficeSetups = routing.type === 'onsite' ? getBoxOfficeSetupsByRoutingId(routing.id) : [];

                  return (
                    <TableRow key={routing.id}>
                      <TableCell>
                        <div className={styles.routingName}>
                          <span className={styles.routingId}>{routing.id}</span>
                          <span>{routing.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={styles.typeCell}>
                          <FontAwesomeIcon icon={typeInfo.icon} className={styles.typeIcon} />
                          <span>{typeInfo.label}</span>
                          {routing.type === 'onsite' && boxOfficeSetups.length > 0 && (
                            <div className={styles.setupIndicator}>
                              <span className={styles.setupCount}>
                                {boxOfficeSetups.length} {boxOfficeSetups.length === 1 ? 'setup' : 'setups'}
                              </span>
                              <div className={styles.setupTooltip}>
                                <div className={styles.tooltipTitle}>Box Office Setups</div>
                                {boxOfficeSetups.map(setup => {
                                  const warehouse = getWarehouse(setup.warehouseId);
                                  return (
                                    <div key={setup.id} className={styles.tooltipItem}>
                                      <span className={styles.tooltipSetupName}>{setup.name}</span>
                                      {warehouse && (
                                        <span className={styles.tooltipWarehouse}>{warehouse.name}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event ? (
                          <div className={styles.eventCell}>
                            <span className={styles.eventName}>{event.name}</span>
                            <span className={styles.eventMeta}>{event.venue}, {event.city}</span>
                          </div>
                        ) : (
                          <span className={styles.unknown}>Unknown event</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={styles.warehouseList}>
                          {warehouses.map(warehouse => {
                            const isPriceRef = routing.type === 'onsite' && 
                                               warehouses.length > 1 && 
                                               routing.priceReferenceWarehouseId === warehouse!.id;
                            return (
                              <div key={warehouse!.id} className={styles.warehouseItem}>
                                <Badge variant="info" size="sm">
                                  {warehouse!.name}
                                </Badge>
                                {isPriceRef && (
                                  <span className={styles.priceRefIndicator}>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[routing.status]}>
                          {routing.status.charAt(0).toUpperCase() + routing.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">
                        <div className={styles.actions}>
                          <button 
                            className={styles.actionBtn}
                            onClick={() => handleEdit(routing.id)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </div>
      </Card>
    </div>
  );
}
