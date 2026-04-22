import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Groups2Icon from '@mui/icons-material/Groups2';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';

function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = async () => {
    if (!newsletterEmail.trim()) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (!newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await api.post('/notifications/newsletter-subscribe', {
        email: newsletterEmail.trim().toLowerCase()
      });
      toast.success('Thank you for subscribing to our newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed. Please try again.');
    }
  };

  
  const visuals = useMemo(
    () => ({
      hero:
        'https://source.unsplash.com/1800x1000/?cow,goat,sheep,ram',
      cow:
        'https://i.pinimg.com/736x/1b/fc/ae/1bfcae3e7b4b71ae5285edf20af2861c.jpg',
      goat:
        'https://i.pinimg.com/736x/16/0f/ac/160facd901c9813c949e51636c108805.jpg',
      sheep:
        'https://i.pinimg.com/736x/a5/58/7d/a5587df56e58dbb5df36c59c4752e5d2.jpg',
      ram:
        'https://i.pinimg.com/736x/15/52/0b/15520bf43560630513aa17d9022c81e2.jpg',
      testimonialA:
        'https://source.unsplash.com/300x300/?cow',
      testimonialB:
        'https://source.unsplash.com/300x300/?goat',
      testimonialC:
        'https://source.unsplash.com/300x300/?sheep,ram'
    }),
    []
  );

  const whyChoose = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 38 }} />,
      title: 'Clear Delivery Tracking',
      description: 'Agromart shows order status updates and delivery countdown details in the dashboard, so buyers can monitor delivery progress from placement to arrival.'
    },
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 38 }} />,
      title: 'Structured Buying Flow',
      description: 'The platform provides product details, cart, checkout, and order history in one flow, making livestock purchases easier to review and complete.'
    },
    {
      icon: <Groups2Icon sx={{ fontSize: 38 }} />,
      title: 'Role-Based Access',
      description: 'Separate buyer and admin journeys are built in, with protected routes for account actions and admin pages for orders, stats, and activity monitoring.'
    }
  ];

  const testimonials = [
    {
      name: 'Segun O.',
      image: visuals.testimonialA,
      text: 'I ordered two goats for restocking and tracked the order from processing to delivery on my dashboard. The delivery countdown helped my team prepare the pen before arrival.'
    },
    {
      name: 'Amina S.',
      image: visuals.testimonialB,
      text: 'I compared ram and sheep listings and completed checkout in one session. My order history made it easy to repeat the same purchase later.'
    },
    {
      name: 'Ibrahim K.',
      image: visuals.testimonialC,
      text: 'After updating my profile details, future orders used the correct contact information. I also got clear status updates, so I did not need to call support to confirm progress.'
    }
  ];

  const animalCategoryVisuals = [
    { name: 'Cow', image: visuals.cow },
    { name: 'Goat ', image: visuals.goat },
    { name: 'Ram ', image: visuals.ram },
    { name: 'Sheep ', image: visuals.sheep }
  ];

  return (
    <Stack spacing={6}>
      <MotionSection>
        <Box
        component={motion.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          position: 'relative',
          borderRadius: 6,
          p: { xs: 4, md: 10 },
          color: 'white',
          background: 'linear-gradient(120deg, rgba(17,61,38,0.94), rgba(91,59,24,0.78))',
          boxShadow: '0 20px 45px rgba(17, 61, 38, 0.24)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          <Chip label="Fresh, direct, and traceable" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, maxWidth: 780 }}>
            Livestock Delivered to Your Doorstep
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 620 }}>
            Agromart is Nigeria's leading livestock marketplace, connecting farmers directly to buyers nationwide. We specialize in sourcing premium cows, goats, rams, and sheep from verified producers, ensuring quality, health, and fair pricing. Our platform eliminates middlemen, reduces costs, and provides live tracking for every delivery. Whether you're a restaurant owner, food processor, or individual buyer, Agromart makes acquiring healthy livestock simple, transparent, and reliable with same-day checkout and dependable nationwide delivery.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, width: { xs: '100%', sm: 'auto' } }}>
            <Button component={Link} to="/register" variant="contained" color="warning" size="large" sx={{ px: 4 }}>
              Shop Now
            </Button>
          </Stack>
        </Box>
        </Box>
      </MotionSection>

      <MotionSection id="categories-livestock">
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Categories of Livestock</Typography>
          <Grid container spacing={2}>
            {animalCategoryVisuals.map((category) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.name}>
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 18px 40px rgba(10, 39, 25, 0.22)'
                    }
                  }}
                >
                  <CardMedia
                    image={category.image}
                    component="img"
                    height="360"
                    alt={category.name}
                    sx={{ transition: 'transform 0.45s ease', '&:hover': { transform: 'scale(1.04)' } }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{category.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </MotionSection>

      <MotionSection>
        <section>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Why Choose Agromart</Typography>
          <Grid container spacing={2}>
            {whyChoose.map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                <Card sx={{ borderRadius: 4, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ color: 'success.main', mb: 1 }}>{item.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography color="text.secondary">{item.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </section>
      </MotionSection>

      <MotionSection>
        <section>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Customer Testimonials</Typography>
        <Grid container spacing={2}>
          {testimonials.map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.name}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar src={item.image} alt={item.name} />
                    <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  </Stack>
                  <Typography>{item.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        </section>
      </MotionSection>

      <MotionSection>
        <Box
          sx={{
            borderRadius: 6,
            p: { xs: 4, md: 8 },
            background: 'linear-gradient(130deg, #1f5f3b, #5f3b20)',
            color: 'white'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 900, maxWidth: 700 }}>
            Ready to Upgrade Your Farm Supply Chain?
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 620 }}>
            Discover healthy livestock and reliable farm supplies from trusted producers. Get started in minutes.
          </Typography>
          <Button component={Link} to="/register" variant="contained" color="warning" sx={{ mt: 3, px: 4 }}>
            Start Shopping
          </Button>
        </Box>
      </MotionSection>

      <MotionSection>
        <Card sx={{ borderRadius: 6 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Join Our Newsletter</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Get weekly livestock pricing updates, market insights, and exclusive deals.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              <TextField
                placeholder="Enter your email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                fullWidth
              />
              <Button variant="contained" color="success" sx={{ px: 3 }} onClick={handleSubscribe}>
                Subscribe
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </MotionSection>

      <Box
        component="footer"
        sx={{
          borderRadius: 4,
          bgcolor: '#163a2b',
          color: 'white',
          p: { xs: 3, md: 5 }
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Agromart</Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.85)' }}>
              Contact: agromart@gmail.com
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>Phone: +234 000 000 0000</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Quick Links</Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Typography component={Link} to="/products" sx={{ textDecoration: 'none', color: 'rgba(255,255,255,0.9)' }}>Shop</Typography>
              <Typography component={Link} to="/dashboard" sx={{ textDecoration: 'none', color: 'rgba(255,255,255,0.9)' }}>Dashboard</Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Follow Us</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <IconButton sx={{ color: 'white' }}><FacebookIcon /></IconButton>
              <IconButton sx={{ color: 'white' }}><InstagramIcon /></IconButton>
              <IconButton sx={{ color: 'white' }}><XIcon /></IconButton>
            </Stack>
          </Grid>
        </Grid>
        <Typography sx={{ mt: 3, color: 'rgba(255,255,255,0.8)' }}>
          Copyright © 2026 Agromart. All rights reserved.
        </Typography>
      </Box>
    </Stack>
  );
}

function MotionSection({ children, ...props }) {
  return (
    <Box
      {...props}
      component={motion.div}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </Box>
  );
}

export default HomePage;
