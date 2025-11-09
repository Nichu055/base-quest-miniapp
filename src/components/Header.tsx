interface HeaderProps {
  account: string;
}

function Header({ account }: HeaderProps) {
  const shortAddress = `${account.slice(0, 6)}...${account.slice(-4)}`;

  return (
    <header className="bg-surface/90 border-b border-border px-5 py-4 sticky top-0 z-[100] backdrop-blur-[10px]">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold gradient-text">⚡ Base Quest</h1>
        <div className="flex items-center gap-2 bg-surface-light px-4 py-2 rounded-[20px] border border-border text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          {shortAddress}
        </div>
      </div>
    </header>
  );
}

export default Header;
