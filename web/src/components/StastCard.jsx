const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-info">
          <p className="stats-card-label">{title}</p>
          <p className="stats-card-value">{value}</p>
        </div>
        <div className={`stats-card-icon ${color}`}>
          <Icon className="icon-lg" />
        </div>
      </div>
    </div>
  );
};
export default StatsCard;