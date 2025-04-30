"use client"
import Header from '@/components/Header';

export default function DashboardLayout({ children }) {

  return (
    <>
      <Header />
      <div className='dashboard'>
        <main className="main">
          {children}
        </main>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f9fafb;
          color: black;
        }
        .header {
          height: 60px;
          background: #047857;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .title {
          font-weight: bold;
          font-size: 1.5rem;
        }
        .account {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .account button {
          background: white;
          color: #047857;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        .account button:hover {
          background: #e0f2f1;
        }
        .main {
          flex: 1;
          padding: 24px;
        }
      `}</style>
    </>
  );
}
