// start of definition 
if (!window.TabbrowserSmoothResizeService) {

var TabbrowserSmoothResizeService = {

	enabled : true,

	defaultPref      : 'chrome://tabextensions_smoothresize/content/default.js',
	defaultPrefLight : 'chrome://tabextensions_smoothresize/content/default.js',
	
	// properties 
	
	get service() 
	{
		if (this._service === void(0))
			this._service = 'TabbrowserService' in window ? window.TabbrowserService : null ;

		return this._service;
	},
//	_service : null,
  
	// ƒCƒxƒ“ƒg‚Ì•ß‘¨ 
	
	onAfterInit : function() 
	{
		var b = this.service.browsers;
		if (!b || !b.length) return;

		var j;
		for (var i = 0; i < b.length; i++)
		{
			if (b[i].localName != 'tabbrowser') continue;
			b[i].addEventListener('XULTabbrowserTabAdded', this.onXULTabbrowserTabAdded, false);
//			window.addEventListener('resize', this.onResize, true);

			for (j in b[i].mTabs)
			{
				if (!b[i].mTabs[j].selected)
					b[i].mTabs[j].mBrowser.setAttribute('tabbrowser-inactive', true)
				this.registerHandler(b[i].mTabs[j]);
			}
		}

		this.service.addPrefListener(gTSSmoothResizingPrefListener);
		gTSSmoothResizingPrefListener.observe(null, 'nsPref:changed', null);
	},
 
	onBeforeDestruct : function() 
	{
		var b = this.service.browsers;
		if (!b || !b.length) return;

		for (var i = 0; i < b.length; i++)
		{
			if (b[i].localName != 'tabbrowser') continue;
			b[i].removeEventListener('XULTabbrowserTabAdded', this.onXULTabbrowserTabAdded, false);
//			window.removeEventListener('resize', this.onResize, true);
		}

		this.service.removePrefListener(gTSSmoothResizingPrefListener);
	},
 
	onXULTabbrowserTabAdded : function(aEvent) 
	{
		var t = aEvent.target.getTabByTabId(aEvent.tabId);
		if (!t.selected)
			t.mBrowser.setAttribute('tabbrowser-inactive', true);

		TabbrowserSmoothResizeService.registerHandler(t);
	},
 
	onResize : function(aEvent) 
	{
		var b = TabbrowserSmoothResizeService.service.browsers;
		for (var i in b)
			if (b[i].selectedTab)
				TabbrowserSmoothResizeService.updateBrowserSize(b[i].selectedTab.mBrowser);
	},
 
	registerHandler : function(aTab) 
	{
		var b = aTab.mBrowser;
		aTab.watch(
			'selected',
			function(aProperty, aOldValue, aNewValue)
			{
				if (aNewValue)
					TabbrowserSmoothResizeService.activateBrowser(b);
				else
					TabbrowserSmoothResizeService.unactivateBrowser(b);

				return aNewValue;
			}
		);
	},
	
	activateBrowser : function(aBrowser) 
	{
//		this.updateBrowserSize(aBrowser);
		aBrowser.removeAttribute('tabbrowser-inactive');
	},
 
	unactivateBrowser : function(aBrowser) 
	{
		aBrowser.setAttribute('tabbrowser-inactive', true);
	},
  
	updateBrowserSize : function(aBrowser) 
	{
		var box     = aBrowser.boxObject;
		var realBox = aBrowser.mRealBrowser.boxObject;
		if (realBox.width != box.width || realBox.height != box.height)
			aBrowser.mRealBrowser.setAttribute(
				'style',
				[
					'width: '+box.width+'px !important',
					'min-width: '+box.width+'px !important',
					'max-width: '+box.width+'px !important',
					'height: '+box.height+'px !important',
					'min-height: '+box.height+'px !important',
					'max-height: '+box.height+'px !important'
				].join(';')
			);
	}
  
}; 
 
gTSSmoothResizingPrefListener = { 
	domain  : 'browser.tabs.extensions.enable_smooth_resizing',
	observe : function(aSubject, aTopic, aPrefName)
	{
		if (aTopic != 'nsPref:changed') return;

		if (TabbrowserService.getPref(this.domain))
			window.document.documentElement.setAttribute('smoothresize', true);
		else
			window.document.documentElement.removeAttribute('smoothresize');
	}
};
  
// end of definition 

if (!window.TabbrowserServiceModules)
	window.TabbrowserServiceModules = [];
TabbrowserServiceModules.push(TabbrowserSmoothResizeService);
}
 
