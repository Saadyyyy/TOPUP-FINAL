interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const CoinIcon = ({ className, width = 24, height = 24 }: IconProps) => (
  <img
    src="/assets/coin.svg"
    alt="Coin"
    width={width}
    height={height}
    className={className}
  />
);

export const LogoIcon = ({ className, width = 48, height = 48 }: IconProps) => (
  <img
    src="/assets/logo.svg"
    alt="Logo"
    width={width}
    height={height}
    className={className}
  />
);

export const BoxIcon = ({ className, width = 48, height = 48 }: IconProps) => (
  <img
    src="/assets/box.svg"
    alt="Box"
    width={width}
    height={height}
    className={className}
  />
);
