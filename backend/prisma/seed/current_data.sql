pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: cats
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

\restrict beg15tobo1hQN1tadNy5zpqWHmzPuKPEAnFHYadnd9f6aE92dtH3JEiiSqYJFSa

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: breeds; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- Data for Name: coat_colors; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- Data for Name: cats; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- Data for Name: cat_tags; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mycats
--



--
-- PostgreSQL database dump complete
--

\unrestrict beg15tobo1hQN1tadNy5zpqWHmzPuKPEAnFHYadnd9f6aE92dtH3JEiiSqYJFSa

