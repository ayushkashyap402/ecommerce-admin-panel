import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  Smartphone,
  VideoLibrary,
  LiveTv,
  ShoppingCart,
  Favorite,
  LocalShipping,
  Payment,
  Security,
  Speed,
  ArrowForward,
  CheckCircle,
  Star
} from '@mui/icons-material';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: 'Reel-Based Shopping',
      description: 'Shop directly from engaging video reels with tagged products'
    },
    {
      icon: <LiveTv sx={{ fontSize: 40 }} />,
      title: 'Live Shopping',
      description: 'Real-time shopping experience with live product showcases'
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      title: 'Smart Cart',
      description: 'Intelligent cart management with real-time updates'
    },
    {
      icon: <Favorite sx={{ fontSize: 40 }} />,
      title: 'Wishlist',
      description: 'Save your favorite items for later purchase'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Order Tracking',
      description: 'Real-time order status updates and delivery tracking'
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Secure Payments',
      description: 'Multiple payment options with Razorpay integration'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Safe',
      description: 'End-to-end encryption and secure authentication'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth shopping experience'
    }
  ];

  const stats = [
    { label: 'Product Categories', value: '6+' },
    { label: 'Features', value: '20+' },
    { label: 'Active Sellers', value: '100+' },
    { label: 'Happy Customers', value: '1000+' }
  ];

  const techStack = [
    'React Native',
    'Real-time Updates',
    'Secure Payments',
    'Live Shopping',
    'Video Reels',
    'Order Tracking',
    'Multi-vendor',
    'Cloud Storage'
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: '2rem', md: '2.75rem' }
                  }}
                >
                  OutfitGo Admin Panel
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    opacity: 0.95,
                    fontWeight: 400
                  }}
                >
                  Next-Generation E-Commerce Platform
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    opacity: 0.9
                  }}
                >
                  A complete e-commerce solution with innovative reel-based shopping, 
                  live streaming, real-time order tracking, and seamless payment integration. 
                  Built with modern microservices architecture for scalability and performance.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: '#00bd7d',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f0f0f0',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Admin Login
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Smartphone sx={{ fontSize: 150, opacity: 0.9 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  py: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#00bd7d',
                    mb: 1
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="features">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#1a1a1a'
            }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Everything you need for a modern e-commerce experience
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 189, 125, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 189, 125, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#00bd7d'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: '#1a1a1a'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tech Stack Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              Key Technologies
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6b7280',
                fontSize: '1.1rem'
              }}
            >
              Built with cutting-edge technology for best performance
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center'
            }}
          >
            {techStack.map((tech, index) => (
              <Chip
                key={index}
                label={tech}
                sx={{
                  px: 2,
                  py: 3,
                  fontSize: '1rem',
                  fontWeight: 500,
                  bgcolor: 'rgba(0, 189, 125, 0.1)',
                  color: '#00bd7d',
                  '&:hover': {
                    bgcolor: 'rgba(0, 189, 125, 0.2)'
                  }
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Key Highlights Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#1a1a1a'
              }}
            >
              Why OutfitGo?
            </Typography>
            <Stack spacing={2}>
              {[
                'Shop from engaging video reels',
                'Live shopping with real sellers',
                'Track your orders in real-time',
                'Secure payment options',
                'Easy returns & refunds',
                'Save favorites to wishlist',
                'Multiple product categories',
                'Fast & reliable delivery'
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: '#00bd7d', fontSize: 24 }} />
                  <Typography variant="body1" sx={{ color: '#4b5563' }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                For Sellers & Admins
              </Typography>
              <Stack spacing={2}>
                {[
                  'Manage Your Products',
                  'Track Orders & Sales',
                  'Handle Returns Easily',
                  'View Sales Analytics',
                  'Go Live & Sell',
                  'Real-time Notifications'
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Star sx={{ fontSize: 24 }} />
                    <Typography>{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: '1.1rem',
              opacity: 0.9
            }}
          >
            Access the admin panel to manage your e-commerce platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: 'white',
              color: '#00bd7d',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#f0f0f0',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s'
            }}
          >
            Go to Admin Panel
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#1a1a1a',
          color: 'white',
          py: 4,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2026 OutfitGo. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
            Your trusted shopping companion
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
