import { useEffect, memo } from 'react';
import { geoCentroid } from 'd3-geo';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import useSWR from 'swr';
import ReactTooltip from 'react-tooltip';
import { fetchCandidates, fetchResults } from '../api';
import allStates from '../data/allstates.json';
import * as constants from '../constants';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const offsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21],
};

const MapChart = ({ setTooltipContent }) => {
  const { data: candidates } = useSWR('candidates', fetchCandidates, {
    suspense: true,
  });
  const { data: results } = useSWR('results', fetchResults, {
    refreshInterval: 60000,
    refreshWhenHidden: true,
    suspense: true,
  });

  useEffect(() => {
    ReactTooltip.rebuild(); // ??  for styles??
  }, []);

  const getStateWinnerColor = (geoId) => {
    const cur = allStates.find((s) => s.val === geoId);

    if (!results[cur.id]) return null;

    const stateResults = results[cur.id][0].summary.results;
    const winner = stateResults.find((i) => i.hasOwnProperty('winner'));

    if (winner) {
      return candidates[winner.candidateID].fullName === 'Donald Trump'
        ? constants.RED
        : constants.BLUE;
    }

    const { candidateID } = stateResults.sort(
      (a, b) => b.voteCount - a.voteCount
    )[0];
    return candidates[candidateID].fullName === 'Donald Trump'
      ? constants.LIGHT_RED
      : constants.LIGHT_BLUE;
  };

  const handleMouseEnter = (geoId, name) => {
    const cur = allStates.find((s) => s.val === geoId);
    const { summary } = results[cur.id][0];
    const winner = summary.results.find((i) => i.hasOwnProperty('winner'));

    setTooltipContent({
      name,
      electTotal: summary.electTotal,
      eevp: summary.eevp,
      winner: winner ? candidates[winner.candidateID] : null,
    });
    ReactTooltip.rebuild();
  };

  return (
    <ComposableMap data-tip="" projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>
        {({ geographies }) => (
          <>
            {geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                stroke="#FFF"
                geography={geo}
                fill="#DDD"
                style={{
                  default: {
                    fill: getStateWinnerColor(geo.id),
                    outline: 'none',
                  },
                  hover: {
                    fill: getStateWinnerColor(geo.id),
                    outline: 'none',
                  },
                  pressed: {
                    fill: getStateWinnerColor(geo.id),
                    outline: 'none',
                  },
                }}
                onMouseEnter={() =>
                  handleMouseEnter(geo.id, geo.properties.name)
                }
                onMouseLeave={() => setTooltipContent(null)}
              />
            ))}
            {geographies.map((geo) => {
              const centroid = geoCentroid(geo);
              const cur = allStates.find((s) => s.val === geo.id);
              return (
                <g key={geo.rsmKey + '-name'}>
                  {cur &&
                    centroid[0] > -168 &&
                    centroid[0] < -67 &&
                    (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                      <Marker coordinates={centroid}>
                        <text
                          y="2"
                          fontSize={14}
                          textAnchor="middle"
                          fill="#FFF"
                        >
                          {cur.id}
                        </text>
                      </Marker>
                    ) : (
                      <Annotation
                        subject={centroid}
                        dx={offsets[cur.id][0]}
                        dy={offsets[cur.id][1]}
                      >
                        <text x={4} fontSize={14} alignmentBaseLine="middle">
                          {cur.id}
                        </text>
                      </Annotation>
                    ))}
                </g>
              );
            })}
          </>
        )}
      </Geographies>
    </ComposableMap>
  );
};
export default memo(MapChart);
