// Entry point for the Home bundle (see `npm run build`). Pure side-effect imports + render.
import './i18n.js';
import './foundation.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.FoundationSystem));
