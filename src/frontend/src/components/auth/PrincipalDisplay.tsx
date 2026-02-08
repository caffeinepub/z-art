import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function PrincipalDisplay() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return null;
  }

  const principal = identity.getPrincipal().toText();

  // Truncate long principals for display
  const displayPrincipal = principal.length > 20 
    ? `${principal.slice(0, 10)}...${principal.slice(-8)}`
    : principal;

  return (
    <div 
      className="text-xs font-mono text-muted-foreground px-2 py-1 rounded bg-muted/50 max-w-[200px] truncate"
      title={principal}
    >
      {displayPrincipal}
    </div>
  );
}
