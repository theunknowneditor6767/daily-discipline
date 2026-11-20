import { render } from 'preact';
import { createStore } from './store/db';
import { App } from './ui/App';
import './styles.css';

render(<App store={createStore()} />, document.getElementById('app')!);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}
