-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2017 at 12:14 PM
-- Server version: 10.1.10-MariaDB
-- PHP Version: 5.6.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `simcha_fund`
--
CREATE DATABASE IF NOT EXISTS `simcha_fund` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `simcha_fund`;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `user_name` varchar(30) NOT NULL,
  `password` varchar(72) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`user_name`, `password`) VALUES
('moishy', '$2a$06$eSRjTA.9O/gEAXN2bByqpu34elKiQQNi.qvXiY9uJOJlI3D9DCHZm');

-- --------------------------------------------------------

--
-- Table structure for table `contributor_details`
--

CREATE TABLE `contributor_details` (
  `contributor_id` int(11) NOT NULL,
  `simcha_id` int(11) NOT NULL,
  `amout_contributed` decimal(7,2) NOT NULL,
  `date_contributed` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `contributor_details`
--

INSERT INTO `contributor_details` (`contributor_id`, `simcha_id`, `amout_contributed`, `date_contributed`) VALUES
(29, 5, '36.00', '2017-05-25'),
(29, 6, '5.00', '2017-05-26'),
(30, 6, '23.60', '2017-05-26'),
(30, 7, '18.00', '2017-05-30'),
(30, 7, '18.00', '2017-05-30'),
(30, 7, '18.00', '2017-05-30'),
(31, 5, '22.00', '2017-06-02'),
(29, 5, '22.00', '2017-06-02'),
(29, 9, '10.00', '2017-06-02'),
(29, 9, '12.00', '2017-06-02'),
(31, 5, '12.00', '2017-06-02'),
(29, 5, '12.00', '2017-06-02');

-- --------------------------------------------------------

--
-- Table structure for table `contributor_info`
--

CREATE TABLE `contributor_info` (
  `id` int(11) NOT NULL,
  `first_name` varchar(15) NOT NULL,
  `last_name` varchar(15) NOT NULL,
  `balance` decimal(6,2) NOT NULL,
  `password` varchar(75) DEFAULT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `contributor_info`
--

INSERT INTO `contributor_info` (`id`, `first_name`, `last_name`, `balance`, `password`, `active`) VALUES
(29, 'Moshe', 'Ritterman', '289.00', NULL, 1),
(30, 'chaim', 'deutch', '156.93', NULL, 0),
(31, 'Chaim Yankel', 'Weisner', '366.32', '$2a$06$Rvgjy1p71hU34Gfc4wMbDe8B7Gmen8mBHaS5TUtAReX0zI/iYleZm', 1),
(32, 'Levi', 'Seigelman', '224.00', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `simcha`
--

CREATE TABLE `simcha` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `simcha_type` varchar(30) NOT NULL,
  `total_collected` decimal(10,2) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `simcha`
--

INSERT INTO `simcha` (`id`, `name`, `simcha_type`, `total_collected`, `active`) VALUES
(5, 'yossi sprei', 'chasuna', '80.00', 1),
(6, 'Avrohom Goldberger', 'Vort', '28.60', 0),
(7, 'chaim sprei', 'bris', '144.00', 0),
(8, 'chaim sprei', 'kiddush', '0.00', 0),
(9, 'Yoni Knopf', 'Sheva Brochos', '10.00', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contributor_details`
--
ALTER TABLE `contributor_details`
  ADD KEY `donater_id` (`contributor_id`),
  ADD KEY `simcha_id` (`simcha_id`);

--
-- Indexes for table `contributor_info`
--
ALTER TABLE `contributor_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `simcha`
--
ALTER TABLE `simcha`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contributor_info`
--
ALTER TABLE `contributor_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
--
-- AUTO_INCREMENT for table `simcha`
--
ALTER TABLE `simcha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `contributor_details`
--
ALTER TABLE `contributor_details`
  ADD CONSTRAINT `fk_donater_id` FOREIGN KEY (`contributor_id`) REFERENCES `contributor_info` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_simch_id` FOREIGN KEY (`simcha_id`) REFERENCES `simcha` (`id`) ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
