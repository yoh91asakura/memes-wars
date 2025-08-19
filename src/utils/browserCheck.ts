// Browser Extension Detection Utility
// Helps identify browser extensions that may cause lockdown errors

export const checkBrowserExtensions = () => {
  // Only run in development or when explicitly enabled
  if (typeof window === 'undefined') {
    return; // Server-side rendering guard
  }

  try {
    // Check for common extension indicators that cause lockdown issues
    const extensionIndicators = [
      'lockdown',
      'harden',
      'compartment',
      'ses', // Secure ECMAScript
      'metamask',
      'ethereum'
    ];

    const detectedExtensions: string[] = [];

    // Check window object for extension indicators
    extensionIndicators.forEach(indicator => {
      if ((window as any)[indicator]) {
        detectedExtensions.push(indicator);
      }
    });

    // Check for MetaMask specifically
    if ((window as any).ethereum?.isMetaMask) {
      detectedExtensions.push('MetaMask');
    }

    // Check for SES/lockdown specific indicators
    if (typeof (window as any).lockdown === 'function') {
      detectedExtensions.push('SES Lockdown');
    }

    // Report findings in development
    if (detectedExtensions.length > 0 && import.meta.env.DEV) {
      console.info(
        '%c⚠️ Browser Security Extensions Detected',
        'color: orange; font-weight: bold; font-size: 12px;',
        `\n🔧 Detected: ${detectedExtensions.join(', ')}`,
        '\n📝 Note: These may cause "Lockdown failed" console errors',
        '\n✅ Application functionality is NOT affected',
        '\n💡 To avoid console noise: use incognito mode during development'
      );

      // Additional specific warning for MetaMask
      if (detectedExtensions.includes('MetaMask') || detectedExtensions.includes('ethereum')) {
        console.info(
          '%c🦊 MetaMask Detected',
          'color: #f6851b; font-weight: bold;',
          '\nMetaMask implements JavaScript hardening that may conflict with Symbol.dispose.',
          '\nThis is expected behavior and does not indicate a bug in the application.'
        );
      }
    }

    return {
      hasExtensions: detectedExtensions.length > 0,
      extensions: detectedExtensions,
      isMetaMask: detectedExtensions.some(ext => 
        ext.toLowerCase().includes('metamask') || ext.toLowerCase().includes('ethereum')
      ),
      hasLockdown: detectedExtensions.includes('SES Lockdown') || detectedExtensions.includes('lockdown')
    };

  } catch (error) {
    // Fail silently - extension detection shouldn't break the app
    console.debug('Browser extension check failed:', error);
    return {
      hasExtensions: false,
      extensions: [],
      isMetaMask: false,
      hasLockdown: false
    };
  }
};

// Error handler for lockdown-specific console errors
export const createLockdownErrorHandler = () => {
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return; // Only in development and client-side
  }

  const originalError = console.error;
  
  console.error = (...args) => {
    // Check if this is a lockdown-related error
    const errorMessage = args[0]?.toString() || '';
    
    if (errorMessage.includes('Lockdown failed') || 
        errorMessage.includes('Cannot delete property') && errorMessage.includes('Symbol')) {
      
      // Show a more user-friendly message
      console.info(
        '%c🛡️ Security Extension Notice',
        'color: #3498db; font-weight: bold;',
        '\nA browser security extension attempted to modify JavaScript built-ins.',
        '\nThis is normal behavior and does not affect the application.',
        '\nOriginal error:', errorMessage
      );
      return; // Suppress the actual error
    }
    
    // Pass through all other errors
    originalError.apply(console, args);
  };
};

// Development helper to check if current environment has lockdown issues
export const getLockdownInfo = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return {
    hasLockdown: typeof (window as any).lockdown === 'function',
    hasHarden: typeof (window as any).harden === 'function',
    hasCompartment: typeof (window as any).Compartment === 'function',
    userAgent: navigator.userAgent,
    extensions: checkBrowserExtensions()
  };
};