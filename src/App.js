import { useState, Suspense } from 'react';
import ReactTooltip from 'react-tooltip';
import './App.css';
import Title from './components/Title';
import MapChart from './components/MapChart';

function App() {
  const [content, setContent] = useState(null);

  return (
    <div className="container">
      <Suspense fallback={<div>Fetching results...</div>}>
        <Suspense fallback={<>Loading...</>}>
          <Title />
        </Suspense>
        <MapChart setTooltipContent={setContent} />
      </Suspense>
      <ReactTooltip
        className="tooltip"
        textColor="black"
        backgroundColor="white"
      >
        {content && (
          <>
            <p className="state">{content.name}</p>
            <p className="elect-total">{content.electTotal} electoral votes</p>
            <p className="eevp">
              {content.eevp}%{' '}
              {content.winner ? `Expected vote` : `of expected vote in`}
            </p>
            {content.winner && (
              <p className="winner-name">Winner: {content.winner.fullName}</p>
            )}
          </>
        )}
      </ReactTooltip>
    </div>
  );
}

export default App;
