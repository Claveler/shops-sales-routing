import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Breadcrumb } from '../common/Breadcrumb';
import { EventSelector } from './EventSelector';
import { WarehouseSelector } from './WarehouseSelector';
import { ChannelSelector } from './ChannelSelector';
import { ChannelRoutingStep } from './ChannelRoutingStep';
import { ReviewStep } from './ReviewStep';
import { useDemo } from '../../context/DemoContext';
import { hasBoxOfficeChannel, isBoxOfficeChannel } from '../../data/mockData';
import type { RoutingStatus, DefaultVisibility } from '../../data/mockData';
import styles from './CreateRoutingWizard.module.css';

interface WizardStep {
  id: string;
  title: string;
  isOptional?: boolean;
}

// Unified wizard steps for all routing types
const wizardSteps: WizardStep[] = [
  { id: 'event', title: 'Event' },
  { id: 'channels', title: 'Channels' },
  { id: 'warehouse', title: 'Warehouses' },
  { id: 'channel-routing', title: 'Routing' },
  { id: 'review', title: 'Review' },
];

export function CreateRoutingWizard() {
  const navigate = useNavigate();
  const demo = useDemo();
  
  // Form state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<string[]>([]);
  const [priceReferenceWarehouseId, setPriceReferenceWarehouseId] = useState<string | null>(null);
  const [channelWarehouseMapping, setChannelWarehouseMapping] = useState<Record<string, string>>({});
  const [channelDefaultVisibility, setChannelDefaultVisibility] = useState<Record<string, DefaultVisibility>>({});
  const [status, setStatus] = useState<RoutingStatus>('draft');
  
  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Derived state based on channel selection
  const hasBoxOffice = hasBoxOfficeChannel(selectedChannelIds);
  const onlineChannelCount = selectedChannelIds.filter(id => !isBoxOfficeChannel(id)).length;
  
  // Warehouse selection rules:
  // - 1 online channel: single warehouse only
  // - N online channels (N > 1): up to N warehouses, price ref if >1
  // - Box Office + 0..N online: unlimited warehouses, price ref if >1
  const allowMultipleWarehouses = hasBoxOffice || onlineChannelCount > 1;
  const maxWarehouses = hasBoxOffice ? Infinity : Math.max(onlineChannelCount, 1);
  const requiresPriceReference = selectedWarehouseIds.length > 1;
  
  // Handle warehouse selection changes
  const handleWarehouseChange = (warehouseIds: string[]) => {
    // Enforce single warehouse for single-channel routing
    if (!allowMultipleWarehouses && warehouseIds.length > 1) {
      setSelectedWarehouseIds([warehouseIds[warehouseIds.length - 1]]);
      return;
    }
    
    // Enforce maxWarehouses cap for multi-online (non-Box-Office) routings
    if (warehouseIds.length > maxWarehouses) {
      setSelectedWarehouseIds(warehouseIds.slice(0, maxWarehouses));
      return;
    }
    
    setSelectedWarehouseIds(warehouseIds);
    
    // Auto-manage price reference
    if (warehouseIds.length === 0) {
      setPriceReferenceWarehouseId(null);
    } else if (warehouseIds.length === 1) {
      setPriceReferenceWarehouseId(warehouseIds[0]);
    } else if (!priceReferenceWarehouseId || !warehouseIds.includes(priceReferenceWarehouseId)) {
      setPriceReferenceWarehouseId(warehouseIds[0]);
    }
    
    // Reset channel-warehouse mapping when warehouses change
    setChannelWarehouseMapping({});
  };
  
  // Handle channel selection changes
  const handleChannelChange = (channelIds: string[]) => {
    setSelectedChannelIds(channelIds);
    
    const newHasBoxOffice = hasBoxOfficeChannel(channelIds);
    const newOnlineCount = channelIds.filter(id => !isBoxOfficeChannel(id)).length;
    const newMaxWarehouses = newHasBoxOffice ? Infinity : Math.max(newOnlineCount, 1);
    
    // Trim warehouses if the new channel selection lowers the cap
    if (selectedWarehouseIds.length > newMaxWarehouses) {
      const trimmed = selectedWarehouseIds.slice(0, newMaxWarehouses);
      setSelectedWarehouseIds(trimmed);
      // Reset price reference if only 1 warehouse left
      if (trimmed.length <= 1) {
        setPriceReferenceWarehouseId(trimmed.length === 1 ? trimmed[0] : null);
      } else if (priceReferenceWarehouseId && !trimmed.includes(priceReferenceWarehouseId)) {
        setPriceReferenceWarehouseId(trimmed[0]);
      }
    }
    
    // Reset channel-warehouse mapping when channels change
    setChannelWarehouseMapping({});
  };
  
  const currentStep = wizardSteps[currentStepIndex];
  
  const canProceed = () => {
    switch (currentStep.id) {
      case 'event':
        return selectedEventId !== null;
      case 'channels':
        return selectedChannelIds.length > 0;
      case 'warehouse':
        if (selectedWarehouseIds.length === 0) return false;
        if (requiresPriceReference && !priceReferenceWarehouseId) return false;
        return true;
      case 'channel-routing':
        // Only online channels need warehouse mapping (Box Office is configured in Box Office Setup)
        const onlineChannelIds = selectedChannelIds.filter(id => !isBoxOfficeChannel(id));
        // If there are no online channels, we can proceed
        if (onlineChannelIds.length === 0) return true;
        return onlineChannelIds.every(channelId => 
          channelWarehouseMapping[channelId] && 
          selectedWarehouseIds.includes(channelWarehouseMapping[channelId])
        );
      case 'review':
        return true; // Review step is always ready
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleCreate = () => {
    const routingData = {
      eventId: selectedEventId!,
      warehouseIds: selectedWarehouseIds,
      channelIds: selectedChannelIds,
      channelWarehouseMapping,
      channelDefaultVisibility: Object.keys(channelDefaultVisibility).length > 0 ? channelDefaultVisibility : undefined,
      priceReferenceWarehouseId: requiresPriceReference ? (priceReferenceWarehouseId || undefined) : undefined,
      status,
    };

    if (demo.isResetMode) {
      demo.createRouting(routingData);
    }
    
    console.log('Created routing:', routingData);
    
    // Navigate back to list
    navigate('/products/sales-routing');
  };
  
  const handleCancel = () => {
    navigate('/products/sales-routing');
  };
  
  const renderStep = () => {
    switch (currentStep.id) {
      case 'event':
        return (
          <EventSelector 
            value={selectedEventId} 
            onChange={setSelectedEventId}
          />
        );
      case 'channels':
        return (
          <ChannelSelector 
            selectedChannelIds={selectedChannelIds}
            onChange={handleChannelChange}
          />
        );
      case 'warehouse':
        return (
          <WarehouseSelector 
            value={selectedWarehouseIds} 
            onChange={handleWarehouseChange}
            allowMultiple={allowMultipleWarehouses}
            maxWarehouses={maxWarehouses}
            priceReferenceId={priceReferenceWarehouseId}
            onPriceReferenceChange={setPriceReferenceWarehouseId}
            selectedChannelIds={selectedChannelIds}
          />
        );
      case 'channel-routing':
        return (
          <ChannelRoutingStep
            selectedChannelIds={selectedChannelIds}
            selectedWarehouseIds={selectedWarehouseIds}
            channelWarehouseMapping={channelWarehouseMapping}
            onChange={setChannelWarehouseMapping}
            channelDefaultVisibility={channelDefaultVisibility}
            onDefaultVisibilityChange={setChannelDefaultVisibility}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            eventId={selectedEventId!}
            channelIds={selectedChannelIds}
            warehouseIds={selectedWarehouseIds}
            priceReferenceWarehouseId={priceReferenceWarehouseId}
            channelWarehouseMapping={channelWarehouseMapping}
            status={status}
            onStatusChange={setStatus}
          />
        );
      default:
        return null;
    }
  };
  
  const isLastStep = currentStepIndex === wizardSteps.length - 1;
  
  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing', path: '/products/sales-routing' },
          { label: 'Create new' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Create sales routing</h1>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          {/* Progress Steps */}
          <div className={styles.progressBar}>
            {wizardSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`${styles.progressStep} ${index <= currentStepIndex ? styles.active : ''} ${index < currentStepIndex ? styles.completed : ''}`}
              >
                <div className={styles.stepIndicator}>
                  {index < currentStepIndex ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={styles.stepLabel}>{step.title}</span>
                {index < wizardSteps.length - 1 && <div className={styles.stepConnector} />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className={styles.stepContent}>
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <div className={styles.navLeft}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div className={styles.navRight}>
              {currentStepIndex > 0 && (
                <Button 
                  variant="outline" 
                  icon={faArrowLeft}
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {isLastStep ? (
                <Button 
                  variant="primary"
                  icon={faCheck}
                  onClick={handleCreate}
                  disabled={!canProceed()}
                >
                  Create routing
                </Button>
              ) : (
                <Button 
                  variant="primary"
                  icon={faArrowRight}
                  iconPosition="right"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
