import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  ElectricCar,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
    { icon: <GitHub />, url: '#', label: 'GitHub' },
  ];

  const footerLinks = {
    'Community': [
      { text: 'About Us', url: '/about' },
      { text: 'Guidelines', url: '/guidelines' },
      { text: 'Help Center', url: '/help' },
      { text: 'Contact', url: '/contact' },
    ],
    'Resources': [
      { text: 'EV News', url: '/category/news' },
      { text: 'Charging Map', url: '/charging-map' },
      { text: 'Reviews', url: '/category/reviews' },
      { text: 'Maintenance Tips', url: '/category/maintenance' },
    ],
    'Legal': [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Cookie Policy', url: '/cookies' },
      { text: 'DMCA', url: '/dmca' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ElectricCar sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                DiscussEV
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The premier community platform for electric vehicle enthusiasts, 
              owners, and experts. Share experiences, get advice, and stay 
              updated on the latest EV trends.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  aria-label={social.label}
                  href={social.url}
                  sx={{ color: 'text.secondary' }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={12} sm={6} md={2.67} key={title}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    color="text.secondary"
                    underline="hover"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} DiscussEV. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for the EV community
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
