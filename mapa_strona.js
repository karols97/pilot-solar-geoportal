//Tworzenie mapy i map bazowych

			    var mbUrl = 'https://api.mapbox.com/styles/	v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW5zYXJwd3IiLCJhIjoiY2szenFya245MXNqeTNwbzF5a2dmaW80NyJ9.60i6AdhPY3LJhu8rfg8mGw';
				var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
					'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 
					' Imagery &copy <a href="https://www.mapbox.com/">Mapbox</a>';
				var	baseSatellite = L.tileLayer(mbUrl, {id: 'mapbox/satellite-streets-v11', attribution: mbAttr, tileSize: 512, zoomOffset: -1});
			   
				var map = L.map('map', {
					center: [50.8325, 15.67894], 
					zoom: 15,
					layers: [baseSatellite]
				});

				//Dodanie panelu z informacjami solarnymi budynku i podkreśleniem obrysu
				var info = L.control({position:"bottomleft"});

				info.onAdd = function (map) {
					this._div = L.DomUtil.create('div', 'info');
					this.update();
				return this._div;
				};

				info.update = function (props) {
					this._div.innerHTML = (props ?
						'Yearly mean solar irradiation: '+ '<b>' + props.ITH_na_m2 + '</b>' + '<b>' + ' kWh/m<sup>2</sup>/year' + '</b><br />' +
						'Solar panels suitable area: ' + '<b>' + props.P_paneli + ' m<sup>2</sup>' + '</b><br />' +
						'Possible energy yield for 19% efficiency panels: ' + '<b>' + props.E_m_na_m2 + ' kWh/m<sup>2</sup>/year' + '</b><br />' +
						'Possible energy yield for 16% efficiency panels: ' + '<b>' + props.E_p_na_m2 + ' kWh/m<sup>2</sup>/year' + '</b><br />' +
						'Possible carbon dioxide reduction for 19% efficiency panels: ' + '<b>' + props.RCO2_m2_m + ' kg/m<sup>2</sup>/year' + '</b><br />' +
						'Possible carbon dioxide reduction for 16% efficiency panels: ' + '<b>' + props.RCO2_m2_p + ' kg/m<sup>2</sup>/year' + '</b><br />' +
						'Mean roof slope: ' + '<b>' + props.MEAN + '°'
						: 'Hover a building');
				};

				info.addTo(map);

				function getColor(d) {
					return d > 1096 ? '#EF2820' :
							d > 945  ? '#F9A248' :
							d > 800  ? '#F1FB7C' :
										'#AACDAB';
				}

				function style(feature) {
					return {
						weight: 1.5,
						opacity: 1,
						color: getColor(feature.properties.ITH_na_m2),
						fillOpacity: 0.50,
						fillColor: getColor(feature.properties.ITH_na_m2)
					}
				}

				function highlightFeature(e) {
    			var layer = e.target;
    			layer.setStyle({
      		  		weight: 5,
      		 		color: '#33cc33',
					fillColor: '#33cc33',
      				dashArray: '',
      				fillOpacity: 1
			    });

   				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
       				layer.bringToFront();
    			}
				info.update(layer.feature.properties);
	    		}

	    		var budynki;

    			function resetHighlight(e) {
   					budynki.resetStyle(e.target);
				}

				function zoomToFeature(e) {
    				map.fitBounds(e.target.getBounds());
				}
		
				function onEachFeature(feature, layer, selection) {
    				layer.on({
        				mouseover: highlightFeature,
        				mouseout: resetHighlight,
        				click: zoomToFeature
					});
				}
				budynki = L.geoJson(bud_kat_2, {
					fillOpacity:0.5,
    				onEachFeature: onEachFeature,
					style: style
				});

				//Dodanie rastrów
                var ith = L.imageOverlay('img/ith_kat_3-min.PNG', [[50.76286225, 15.625601], [50.87135525, 15.786543]], {opacity: 1});
                var dur = L.imageOverlay('img/d_kat_4-min.png', [[50.76286225, 15.625601], [50.87135525, 15.786543]], {opacity: 1});

                //Dodanie pozostałych warstw wektorowych

				var warstwy = {
					"Buildings":budynki,
					"Total solar irradiation":ith,
				}	
		
				var basemaps = {
					"Satellite":baseSatellite
				}

				//Dodanie paneli kontroli widoczności warstw
				
				
				var wid_warstw = L.control.layers({},
					warstwy,
				null, {collapsed:true}).addTo(map);

				L.control.scale({
					position:'bottomright',
					metric: 'true',
					maxWidth: 200
				}).addTo(map);

				L.control.mousePosition({
					position: 'bottomright',
					separator: '     ,     '
				}).addTo(map);

				map.zoomControl.setPosition('bottomright');

				//Dodanie legendy
				var legend = L.control({position:"topleft"});

				legend.onAdd = function(map) {
					var div = L.DomUtil.create("div", "legend");
					div.innerHTML += "<h4>Rooftop solar suitability:</h4>";
					div.innerHTML += '<i style="background: #AACDAB"></i><span>Unsuitable</span><br>';
					div.innerHTML += '<i style="background: #F1FB7C"></i><span>Suitable</span><br>';
					div.innerHTML += '<i style="background: #F9A248"></i><span>High</span><br>';
  					div.innerHTML += '<i style="background: #EF2820"></i><span>Very high</span><br>';
 					return div;
				};

				legend.addTo(map);

				//Ustawienie początkowej widoczności warstw
				budynki.addTo(map);
				//Dodanie sidebara
                var sidebar = L.control.sidebar('sidebar', {
			    closeButton: true,
			    position: 'left',
                });