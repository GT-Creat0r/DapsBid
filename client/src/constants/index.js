import { createCampaign, dashboard, logout, payment, profile, withdraw } from '../assets';

export const navlinks = [
  {
    name: 'Dashboard',
    imgUrl: dashboard,
    link: '/',
  },
  {
    name: 'Election',
    imgUrl: createCampaign,
    link: '/create-election',
  },
  {
    name: 'Organizer',
    imgUrl: payment,
    link: '/register-organizer',
  },
  {
    name: 'Vote',
    imgUrl: withdraw,
    link: '/vote',
  },
  {
    name: 'Add Candidate',
    imgUrl: withdraw,
    link: '/add-candidate',
  },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/',
    disabled: true,
  },
];
