// Skeleton screen components for loading states
export const CardSkeleton = ({ isDarkMode, colors }) => (
  <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: colors.cardBg }}>
    <div style={{
      background: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      height: '120px',
      borderRadius: '8px',
      animation: 'pulse 1.5s infinite'
    }} />
  </div>
);

export const TableRowSkeleton = ({ isDarkMode, colors, colCount = 5 }) => (
  <tr>
    {[...Array(colCount)].map((_, i) => (
      <td key={i} style={{ padding: '1rem' }}>
        <div
          style={{
            height: '20px',
            background: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            animation: 'pulse 1.5s infinite'
          }}
        />
      </td>
    ))}
  </tr>
);

export const PositionCardSkeleton = ({ isDarkMode, colors }) => (
  <div className="col-lg-6 mb-4">
    <div
      className="card shadow-sm border-0 h-100"
      style={{
        backgroundColor: colors.cardBg,
        borderLeft: '5px solid rgba(75, 85, 99, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          background: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          height: '100px',
          animation: 'pulse 1.5s infinite'
        }}
      />
      
      {/* Table skeleton */}
      <div className="card-body p-0">
        <table className="table mb-0">
          <tbody>
            {[...Array(3)].map((_, i) => (
              <TableRowSkeleton key={i} isDarkMode={isDarkMode} colors={colors} colCount={5} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart skeleton */}
      <div style={{ padding: '1.5rem' }}>
        <div
          style={{
            height: '250px',
            background: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite'
          }}
        />
      </div>
    </div>
  </div>
);
