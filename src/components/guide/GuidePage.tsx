import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRoute,
  faWarehouse,
  faDollarSign,
  faStore,
  faLightbulb,
  faArrowRight,
  faBoxOpen,
  faSatelliteDish,
  faShoppingCart,
  faEye,
  faInfoCircle,
  faMagicWandSparkles,
  faRotateLeft,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from '../common/PageHeader';
import styles from './GuidePage.module.css';

export function GuidePage() {
  return (
    <>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Guide' },
        ]}
        title="Getting Started Guide"
        subtitle="Learn how to set up product sales for your events, step by step."
      />

      <div className={styles.pageBody}>
        {/* Internal notice */}
        <div className={styles.internalBanner}>
          <FontAwesomeIcon icon={faInfoCircle} className={styles.internalBannerIcon} />
          <div>
            <strong>For the squad only</strong> &mdash; This Guide tab is part of the mockup and won't ship in the final implementation. It's here so the team can understand the full setup flow we need to build. Use it as a reference when working on the features described below.
          </div>
        </div>

        {/* Demo Flow */}
        <section className={styles.demoFlowSection}>
          <div className={`${styles.card}`}>
            <div className={styles.demoFlowContent}>
              <div className={styles.demoFlowHeader}>
                <div className={styles.demoFlowIconWrapper}>
                  <FontAwesomeIcon icon={faPlay} />
                </div>
                <div>
                  <h2 className={styles.demoFlowTitle}>Interactive Demo</h2>
                  <p className={styles.demoFlowSubtitle}>
                    This mockup loads with <strong>sample data already configured</strong> &mdash; an
                    existing catalog integration, warehouses, products, sales routings, and
                    publications. Feel free to browse around, but for the best experience we
                    recommend following the guided demo flow described below.
                  </p>
                </div>
              </div>

              <div className={styles.demoFlowBlock}>
                <h3 className={styles.demoFlowBlockTitle}>
                  <FontAwesomeIcon icon={faRotateLeft} className={styles.demoFlowBlockIcon} />
                  Starting the demo
                </h3>
                <p className={styles.demoFlowText}>
                  Click the{' '}
                  <strong className={styles.demoFooterBtnLabel}>
                    <FontAwesomeIcon icon={faRotateLeft} /> Reset Demo
                  </strong>{' '}
                  button in the top-right corner of the header. This clears all preloaded
                  data and redirects you to the Catalog Integration page with a blank slate.
                  The button changes to{' '}
                  <strong className={styles.demoFooterBtnLabelActive}>Demo Active</strong>{' '}
                  to confirm you're in demo mode.
                </p>
              </div>

              <div className={styles.demoFlowBlock}>
                <h3 className={styles.demoFlowBlockTitle}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} className={styles.demoFlowBlockIcon} />
                  Following the demo &mdash; how hints work
                </h3>
                <p className={styles.demoFlowText}>
                  Once in demo mode, purple{' '}
                  <span className={styles.demoHintInline}>
                    <FontAwesomeIcon icon={faMagicWandSparkles} /> Fill demo data
                  </span>{' '}
                  and{' '}
                  <span className={styles.demoHintInline}>
                    <FontAwesomeIcon icon={faMagicWandSparkles} /> Select suggested
                  </span>{' '}
                  buttons appear at each step of the wizards. Click them and the system
                  auto-fills the current form with sensible demo values. The hints are{' '}
                  <strong>context-aware</strong> &mdash; they progressively suggest more complex
                  configurations as you create additional routings.
                </p>
              </div>

              <h3 className={styles.demoFlowBlockTitle} style={{ marginTop: 0 }}>Recommended steps</h3>
              <div className={styles.demoSteps}>
                <div className={styles.demoStep}>
                  <span className={styles.demoStepNumber}>1</span>
                  <div>
                    <strong>Create a Catalog Integration</strong>
                    <p>
                      Use <span className={styles.demoHintInline}><FontAwesomeIcon icon={faMagicWandSparkles} /> Fill demo data</span> to
                      populate the integration details and the warehouse list (3 warehouses),
                      then create the integration.
                    </p>
                  </div>
                </div>
                <div className={styles.demoStep}>
                  <span className={styles.demoStepNumber}>2</span>
                  <div>
                    <strong>Sync Products</strong>
                    <p>
                      On the integration details page, click <strong>Sync products</strong> to
                      import 20 demo products distributed across your warehouses.
                    </p>
                  </div>
                </div>
                <div className={styles.demoStep}>
                  <span className={styles.demoStepNumber}>3</span>
                  <div>
                    <strong>Create Sales Routings</strong>
                    <p>
                      Create up to three routings of increasing complexity. At each wizard step,
                      use <span className={styles.demoHintInline}><FontAwesomeIcon icon={faMagicWandSparkles} /> Select suggested</span> or{' '}
                      <span className={styles.demoHintInline}><FontAwesomeIcon icon={faMagicWandSparkles} /> Fill demo data</span> &mdash; the
                      system automatically picks appropriate events, channels, and warehouses
                      for a simple, medium, then advanced routing.
                    </p>
                  </div>
                </div>
                <div className={styles.demoStep}>
                  <span className={styles.demoStepNumber}>4</span>
                  <div>
                    <strong>Second Sync <span className={styles.optionalTag}>optional</span></strong>
                    <p>
                      Click <strong>Sync products</strong> again to import 5 additional products
                      and see how they are automatically published into channels whose warehouses
                      are already mapped.
                    </p>
                  </div>
                </div>
                <div className={styles.demoStep}>
                  <span className={styles.demoStepNumber}>5</span>
                  <div>
                    <strong>Configure Channel Visibility</strong>
                    <p>
                      Go to the Channels page and fine-tune which products are visible in each
                      channel, per event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className={styles.overview}>
          <div className={styles.card}>
            <div className={styles.overviewContent}>
              <h2 className={styles.overviewTitle}>How product sales work</h2>
              <p className={styles.overviewText}>
                The <strong>Products</strong> section lets you connect your
                external product catalog, configure how products are sold at
                each event, and control which products appear in each sales
                channel. The setup follows three steps:
              </p>
              <div className={styles.overviewSteps}>
                <div className={styles.overviewStep}>
                  <span className={styles.overviewStepNumber}>1</span>
                  <span>Connect your catalog</span>
                </div>
                <span className={styles.overviewArrow}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
                <div className={styles.overviewStep}>
                  <span className={styles.overviewStepNumber}>2</span>
                  <span>Create sales routings</span>
                </div>
                <span className={styles.overviewArrow}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
                <div className={styles.overviewStep}>
                  <span className={styles.overviewStepNumber}>3</span>
                  <span>Configure channel visibility</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepBadge}>1</div>
            <h2 className={styles.stepTitle}>Set up your Catalog Integration</h2>
          </div>

          <div className={styles.stepContent}>
            <div className={styles.stepIntro}>
              <h3 className={styles.stepHeading}>Catalog Integration</h3>
              <p className={styles.stepDescription}>
                First, connect your external product catalog. This is where
                Fever pulls your product information, prices, and stock
                levels from. Each partner can have <strong>one catalog
                integration</strong>.
              </p>
            </div>

            <div className={styles.substeps}>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>a</span>
                <div>
                  <strong>Choose your provider</strong>
                  <p>Select either <strong>Square</strong> or <strong>Shopify</strong> as your catalog source.</p>
                </div>
              </div>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>b</span>
                <div>
                  <strong>Enter your catalog ID</strong>
                  <p>Provide the Master Catalog ID from your external system so Fever can connect to it.</p>
                </div>
              </div>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>c</span>
                <div>
                  <strong>Add warehouses</strong>
                  <p>
                    Warehouses represent your inventory locations (e.g., "Main
                    Store", "Gift Shop"). Each warehouse maps to a location in
                    your external system. Products can exist in multiple
                    warehouses with different prices and stock levels.
                  </p>
                </div>
              </div>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>d</span>
                <div>
                  <strong>Sync your products</strong>
                  <p>
                    Once your integration is set up, click <strong>Sync
                    products</strong> to import your catalog. A success
                    notification confirms when the sync completes, and
                    products will appear with their warehouse-specific
                    prices and stock.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/products/catalog-integration" className={styles.stepLink}>
              Go to Catalog Integration
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>

        {/* Step 2 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepBadge}>2</div>
            <h2 className={styles.stepTitle}>Create Sales Routings</h2>
          </div>

          <div className={styles.stepContent}>
            <div className={styles.stepIntro}>
              <h3 className={styles.stepHeading}>Sales Routings</h3>
              <p className={styles.stepDescription}>
                A sales routing tells Fever <em>how</em> products should be
                sold at a specific event: which channels sell them and which
                warehouses supply the stock. Each event has <strong>one
                routing</strong>.
              </p>
            </div>

            <h3 className={styles.substepGroupTitle}>The 5-step wizard</h3>
            <div className={styles.wizardSteps}>
              <div className={styles.wizardStep}>
                <span className={styles.wizardStepNum}>1</span>
                <div>
                  <strong>Event</strong>
                  <p>Pick the event where products will be sold.</p>
                </div>
              </div>
              <div className={styles.wizardStep}>
                <span className={styles.wizardStepNum}>2</span>
                <div>
                  <strong>Channels</strong>
                  <p>Choose which sales channels to use (Box Office, Fever Marketplace, Whitelabel, etc.).</p>
                </div>
              </div>
              <div className={styles.wizardStep}>
                <span className={styles.wizardStepNum}>3</span>
                <div>
                  <strong>Warehouses</strong>
                  <p>Select which warehouses supply stock. The number of warehouses you can select depends on the channels you chose.</p>
                </div>
              </div>
              <div className={styles.wizardStep}>
                <span className={styles.wizardStepNum}>4</span>
                <div>
                  <strong>Routing</strong>
                  <p>Map each online channel to a warehouse and set the default product visibility (all visible or none visible).</p>
                </div>
              </div>
              <div className={styles.wizardStep}>
                <span className={styles.wizardStepNum}>5</span>
                <div>
                  <strong>Review</strong>
                  <p>Review everything and set the routing status (Draft, Active, or Inactive).</p>
                </div>
              </div>
            </div>

            <h3 className={styles.substepGroupTitle}>Routing complexity levels</h3>
            <div className={styles.complexityCards}>
              <div className={styles.complexityCard}>
                <div className={styles.complexityBadge}>Simple</div>
                <strong>Single online channel</strong>
                <p>One channel, one warehouse. The simplest setup. Great for selling through Fever Marketplace only.</p>
              </div>
              <div className={styles.complexityCard}>
                <div className={styles.complexityBadge}>Medium</div>
                <strong>Multiple online channels</strong>
                <p>Several channels, each mapped to a warehouse. Requires choosing a price reference warehouse.</p>
              </div>
              <div className={styles.complexityCard}>
                <div className={styles.complexityBadge}>Advanced</div>
                <strong>Box Office + online</strong>
                <p>Combines onsite POS sales with online channels. Unlocks unlimited warehouses. POS devices are configured separately.</p>
              </div>
            </div>

            <Link to="/products/sales-routing" className={styles.stepLink}>
              Go to Sales Routing
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>

        {/* Step 3 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepBadge}>3</div>
            <h2 className={styles.stepTitle}>Configure Channel Visibility</h2>
          </div>

          <div className={styles.stepContent}>
            <div className={styles.stepIntro}>
              <h3 className={styles.stepHeading}>Channel Visibility</h3>
              <p className={styles.stepDescription}>
                After creating a routing, you can fine-tune <em>which
                products</em> appear in each channel. This goes beyond
                warehouse-level routing and gives you per-product control.
              </p>
            </div>

            <div className={styles.tipBox}>
              <FontAwesomeIcon icon={faInfoCircle} className={styles.tipIcon} />
              <div>
                <strong>Design note:</strong> This page is inspired by the <em>Events &gt; Channels</em> section in the real Fever Zone, adapted for our product-sales use case. Key differences from the original:
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.7' }}>
                  <li><strong>No "Event ready for sale" banner</strong> &mdash; irrelevant here because only events with an active sales routing appear in this view. An event that isn't ready for sale wouldn't have a routing in the first place.</li>
                  <li><strong>No Status toggle</strong> &mdash; activating or deactivating a channel is done in the event's own Channels section, not here. This page only controls <em>product visibility</em> within an already-active routing.</li>
                  <li><strong>No "Edit" side-panel</strong> &mdash; in the real Fever Zone, clicking "Edit" opens a side panel to select ticket types. We use inline eye-icon toggles instead, which is more direct for per-product visibility control.</li>
                  <li><strong>Channel type categories</strong> &mdash; channels are grouped into four types (Box Office, Marketplace, Kiosk, API) that match the Fever Zone filter categories.</li>
                </ul>
              </div>
            </div>

            <div className={styles.substeps}>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>a</span>
                <div>
                  <strong>Select your event</strong>
                  <p>Use the city dropdown and event dropdown to pick a routing, then click <strong>Show</strong> to load the channels for that event.</p>
                </div>
              </div>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>b</span>
                <div>
                  <strong>Toggle product visibility</strong>
                  <p>Click a channel, then use the eye icon to show or hide individual products. Changes are staged until you save.</p>
                </div>
              </div>
              <div className={styles.substep}>
                <span className={styles.substepNumber}>c</span>
                <div>
                  <strong>Bulk edit across channels</strong>
                  <p>Select multiple channels and click "Edit in bulk" to show or hide products across several channels at once.</p>
                </div>
              </div>
            </div>

            <div className={styles.tipBox}>
              <FontAwesomeIcon icon={faLightbulb} className={styles.tipIcon} />
              <div>
                <strong>Default visibility</strong> is set during sales routing creation (Step 2, Routing). If you chose "All visible", every product starts visible and you can hide specific ones. If you chose "None visible", you add products manually.
              </div>
            </div>

            <Link to="/products/channels" className={styles.stepLink}>
              Go to Channels
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>

        {/* Key Concepts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Concepts</h2>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faSatelliteDish} />
              </div>
              <h3>Channels</h3>
              <p>
                Sales channels where your products can be sold. Includes online channels (Fever Marketplace, Whitelabel, Kiosk), OTA channels (GetYourGuide, Viator, Tiqets), and the onsite Box Office.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faWarehouse} />
              </div>
              <h3>Warehouses</h3>
              <p>
                Inventory locations that hold your products. Each warehouse maps to a location in your external system (Square or Shopify) and has its own prices and stock levels.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <h3>Price Reference</h3>
              <p>
                When a routing uses multiple warehouses, you pick one as the price reference. Its prices are used for all channels, while other warehouses only supply stock.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faShoppingCart} />
              </div>
              <h3>Distribution</h3>
              <p>
                A product is "distributed" when its warehouse is mapped to at least one channel in an active routing. Undistributed products aren't available for sale yet.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faStore} />
              </div>
              <h3>Box Office</h3>
              <p>
                The physical POS channel for onsite sales. It's special: it unlocks unlimited warehouses and each POS device can pull stock from a different warehouse.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>
                <FontAwesomeIcon icon={faEye} />
              </div>
              <h3>Product Visibility</h3>
              <p>
                Per-product, per-channel control over what appears in each sales channel. Set defaults when creating a routing, then fine-tune on the Channels page.
              </p>
            </div>
          </div>
        </section>

        {/* Tips & FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tips &amp; FAQ</h2>
          <div className={styles.card}>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <div>
                  <h3 className={styles.faqQuestion}>
                    What happens when I sync new products?
                  </h3>
                  <p className={styles.faqAnswer}>
                    New products are imported from your external catalog. If
                    they land in a warehouse that's already mapped to a channel
                    in an active routing, they'll be automatically distributed.
                    Otherwise, you'll see an "undistributed" warning prompting
                    you to update your routing.
                  </p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>
                  <FontAwesomeIcon icon={faRoute} />
                </div>
                <div>
                  <h3 className={styles.faqQuestion}>
                    Can I change a routing after creating it?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Yes. You can add warehouses, add channels, change
                    channel-warehouse mappings, and update the status. However,
                    you can't remove warehouses or channels once added, and you
                    can't change the event. If a routing is no longer needed,
                    set it to Inactive.
                  </p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <div>
                  <h3 className={styles.faqQuestion}>
                    Why do I need a price reference?
                  </h3>
                  <p className={styles.faqAnswer}>
                    When you use multiple warehouses, each may have different
                    prices for the same product. The price reference warehouse
                    determines the single price used across all channels. Other
                    warehouses only provide stock.
                  </p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div>
                  <h3 className={styles.faqQuestion}>
                    How does Box Office work differently?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Box Office is the only onsite channel. When you add it to a
                    routing, the warehouse limit is removed entirely. Each
                    physical POS device is configured separately to pull from a
                    specific warehouse. Per-product visibility doesn't apply to
                    Box Office — all products in connected warehouses are
                    available.
                  </p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqIcon}>
                  <FontAwesomeIcon icon={faLightbulb} />
                </div>
                <div>
                  <h3 className={styles.faqQuestion}>
                    What's the recommended order?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Follow the three steps in order: first set up your catalog
                    integration, then create sales routings, and finally
                    fine-tune channel visibility. You can always come back and
                    adjust routings or visibility later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
