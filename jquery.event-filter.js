/*!
 * jQuery Event Filter
 * December 13, 2009
 * Corey Hart @ http://www.codenothing.com
 */ 
(function($, undefined){
	// Initialize vars together
	var original, notOperator = false, name, namespace, events, firstChar, i, k;

	// Event filter needs to be capitalized so it doesn't clash with 'even' filter
	$.expr[':'].Event = function(elem, index, params, group){
		// Return false if element doesn't exist, or no query string wasn't provided
                if (elem === undefined || ! params[3] || params[3] == '')
                        return false;
                // Run parsing if new query
                else if (original !== params[3]){
			// Will replace original var later
			original = params[3].split('.');
			// First is the name of the event
			name = original.shift();
			// Add ability to filter by elements that don't have the event
			notOperator = ((firstChar = name.substr(0,1)) === '!');
			// If not operator exists or user is escaping it out as it's part of the event name,
			// remove the name's first character
			if (notOperator || firstChar === "\\") name = name.substr(1);
			// Sort the namespace's like jQuery does in the event module
			namespace = original.sort().join('.');
			// Restore the original param for less processing
			original = params[3];
		}

		// Ensure events exist on element
		if (! (events = $(elem).data('events')) )
			return notOperator;
		// Run check for when only the namespace is passed
		// (Slower, especially when lots of events are attached)
		else if (! name && namespace.length){
			// Search for purely namespaced based event
			for (i in events)
				if (events[i])
					for (k in events[i])
						if (events[i][k].type && events[i][k].type === namespace)
							return !notOperator;
			// Event namespace not found
			return notOperator;
		}
		// Check to ensure event exists on the event object
		else if ( !events[name] )
			return notOperator;
		// Name && namespace passed
		else if ( namespace.length ){
			// Search for namespaced event
			for (i in events[name])
				if (events[name][i].type && events[name][i].type == namespace)
					return !notOperator;
			// Event not found
			return notOperator;
		}

		// No namespace was was defined, so only the event was desired
		return !notOperator;
	};
})(jQuery);
