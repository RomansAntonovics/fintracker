import './loader.css';

export default function Loader({ label = 'Loading_', overlay = false, size = 'md' }) {
    const cls = ['ft-loader', `ft-loader--${size}`];
    if (overlay) cls.push('ft-loader--overlay');
    
    return (
        <div className={cls.join(' ')} aria-live="polite" aria-busy="true">
            <div className="ft-loader__spinner" />
            <span className="ft-loader__label">{label}</span>
        </div> 
    );
}