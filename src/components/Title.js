import useSWR from 'swr';

import { fetchResults } from '../api';
import { RED, BLUE } from '../constants';

const Header = () => {
  const { data: results } = useSWR('results', fetchResults, {
    refreshInterval: 60000,
    refreshWhenHidden: true,
    suspense: true,
  });

  const bidenElectWon = results.US[0].summary.results.find(
    (i) => i.candidateID === 'US1036'
  ).electWon;
  const trumpElectWon = results.US[0].summary.results.find(
    (i) => i.candidateID === 'US8639'
  ).electWon;

  return (
    <h2 className="title">
      <span style={{ color: BLUE }}>{bidenElectWon}</span> Biden | Trump{' '}
      <span style={{ color: RED }}>{trumpElectWon}</span>
    </h2>
  );
};

export default Header;
