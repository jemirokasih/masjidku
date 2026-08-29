import React from 'react';
import ContentManagementPage from './ContentManagementPage';

/**
 * CMSPageManager now renders the unified ContentManagementPage component 
 * defaulting to Tab 2: Banner Hero & Tampilan Website.
 */
export default function CMSPageManager() {
    return <ContentManagementPage defaultTab="hero" />;
}
