import React from 'react';
import {
  Box,
  Typography,
  Link,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  ElectricCar,
  ChargingStation,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const isLight = theme.palette.mode === 'light';

  const socialLinks = [
    { icon: <Twitter sx={{ fontSize: 17 }} />, url: '#', label: 'Twitter', color: '#1DA1F2' },
    { icon: <LinkedIn sx={{ fontSize: 17 }} />, url: '#', label: 'LinkedIn', color: '#0A66C2' },
    { icon: <Facebook sx={{ fontSize: 17 }} />, url: '#', label: 'Facebook', color: '#1877F2' },
    { icon: <Instagram sx={{ fontSize: 17 }} />, url: '#', label: 'Instagram', color: '#E4405F' },
    { icon: <GitHub sx={{ fontSize: 17 }} />, url: '#', label: 'GitHub', color: isLight ? '#24292e' : '#ccc' },
  ];

  const footerLinks = {
    Community: [
      { text: 'About Us', url: '/about' },
      { text: 'Guidelines', url: '/guidelines' },
      { text: 'Help Center', url: '/help' },
      { text: 'Contact', url: '/contact' },
    ],
    Resources: [
      { text: 'EV News', url: '/category/news' },
      { text: 'Charging Map', url: '/charging-map' },
      { text: 'Reviews', url: '/category/reviews' },
      { text: 'Maintenance Tips', url: '/category/maintenance' },
    ],
    Legal: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Cookie Policy', url: '/cookies' },
      { text: 'DMCA', url: '/dmca' },
    ],
  };

  const accent = '#2E7D32';
  const accentLight = '#43A047';
  const border = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)';

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isLight ? '#F8FAFC' : '#0B1120',
        borderTop: '1px solid',
        borderColor: border,
        mt: 'auto',
        width: '100%',
      }}
    >
      {/* ── Main row ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          px: { xs: 4, sm: 5, md: 7, xl: 10 },
          pt: 3,
          pb: 2.5,
          gap: { xs: 3, md: 0 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background watermark EV logo — right side */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -30, md: -10 },
            bottom: -18,
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: isLight ? 0.045 : 0.07,
            lineHeight: 0,
          }}
        >
          <ElectricCar sx={{ fontSize: 180, color: accentLight }} />
        </Box>
        {/* ── Brand block ── */}
        <Box
          sx={{
            flex: '0 0 auto',
            width: { xs: '100%', md: '30%', lg: '26%' },
            pr: { md: 5 },
            borderRight: { md: `1px solid ${border}` },
          }}
        >
          {/* Logo row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '7px',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(46,125,50,0.35)',
              }}
            >
              <ElectricCar sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.4px' }}>
              DiscussEV
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6, mb: 1.75, fontSize: '0.8rem' }}
          >
            The premier community for EV owners, enthusiasts, and innovators. Share experiences,
            get advice, and stay updated on the latest trends.
          </Typography>

          {/* Socials */}
          <Stack direction="row" spacing={0.25}>
            {socialLinks.map((s) => (
              <IconButton
                key={s.label}
                size="small"
                aria-label={s.label}
                href={s.url}
                sx={{
                  color: 'text.secondary',
                  p: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.18s',
                  '&:hover': {
                    color: s.color,
                    bgcolor: `${s.color}18`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {s.icon}
              </IconButton>
            ))}
          </Stack>
        </Box>

        {/* ── Link columns — flex:1 fills all remaining width, space-around distributes evenly ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'space-around',
            pl: { md: 5 },
            gap: { xs: 3, md: 0 },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {Object.entries(footerLinks).map(([title, links]) => (
            <Box key={title} sx={{ flex: 1, minWidth: 110 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'text.primary',
                  mb: 1.5,
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link.text}
                    href={link.url}
                    underline="none"
                    sx={{
                      fontSize: '0.815rem',
                      color: 'text.secondary',
                      width: 'fit-content',
                      transition: 'color 0.15s',
                      '&:hover': { color: accentLight },
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Bottom bar ── */}
      <Box
        sx={{
          borderTop: `1px solid ${border}`,
          px: { xs: 4, sm: 5, md: 7, xl: 10 },
          py: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.73rem' }}>
          © {currentYear} DiscussEV. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.73rem' }}>
            Made with ❤️ for the EV community
          </Typography>
          <ChargingStation sx={{ fontSize: 13, color: accentLight, ml: 0.5 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;