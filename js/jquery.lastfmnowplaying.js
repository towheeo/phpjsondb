/**
 * Last.fm Now Playing
 * v0.1.1
 * Author: Mike Mitchell <@innernets> | DevTeam Inc <http://devteaminc.co/>
 * Licensed under the MIT license
 */

(function ( $, window, document ) {

	'use strict';

	var pluginName = 'lastfmNowPlaying';
	var defaults = {};

	function Plugin( element, options ) {

		this.element = element;
		this.options = $.extend( {}, defaults, options) ;
		this._defaults = defaults;
		this._name = pluginName;
		this.filteredResults = [];
		this.init();
		if(options.refreshPeriod) {
			setInterval(
				(function(self) {
					return function() {
						self.init();
					}
				})(this), options.refreshPeriod);
		}
	}

	/**
	 * Init Plugin
	 */

	Plugin.prototype.init = function () {

		this.getData();
		this.sortData();

	};

	/**
	 * Get Data
	 */

	Plugin.prototype.getData = function () {

		var self = this;

		$( this.options.members ).each( function () {

			var username = this;

			$.ajax({
				url: 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&limit=1&nowplaying=true&api_key=' + self.options.apiKey + '&format=json',
				dataType: 'json'
			}).done( function( data ){

				var usersRecentTrack = data.recenttracks.track;
				self.filterData( usersRecentTrack );

			});

		});

	};

	/**
	* Filter Data
	*/

	Plugin.prototype.filterData = function ( data ) {

		var self = this;
		self.filteredResults = [];
		
		$( data ).each( function () {

			// Check if track is now playing
			var nowPlaying = $(this).attr('@attr');

			// Add date stamp to track if now playing
			if ( nowPlaying ) {
				self.addDateStamp( this );
			}

			self.filteredResults.push( this );

		});

	};

	/**
	 * Sort Data
	 */
	
	Plugin.prototype.sortData = function () {

		var self = this;

		// Perform sorting after we have all our data

		$(document).ajaxStop( function() {
			$(this).unbind("ajaxStop");
			
			// Custom algorithm for sort() method
			function sortbyNewest ( a, b ) {
				return new Date( parseInt( a.date.uts, 10 ) ).getTime() - new 