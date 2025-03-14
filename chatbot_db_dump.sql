--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.attachments (
    id uuid NOT NULL,
    message_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    uploaded_at timestamp without time zone NOT NULL
);


ALTER TABLE public.attachments OWNER TO fumi_042;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    server_id uuid NOT NULL,
    name character varying(50) NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO fumi_042;

--
-- Name: channel_attachments; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.channel_attachments (
    id uuid NOT NULL,
    message_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    uploaded_at timestamp without time zone NOT NULL
);


ALTER TABLE public.channel_attachments OWNER TO fumi_042;

--
-- Name: channel_members; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.channel_members (
    id uuid NOT NULL,
    channel_id uuid NOT NULL,
    user_id uuid NOT NULL,
    added_at timestamp without time zone NOT NULL
);


ALTER TABLE public.channel_members OWNER TO fumi_042;

--
-- Name: channel_messages; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.channel_messages (
    id uuid NOT NULL,
    channel_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    is_edited boolean DEFAULT false NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    edited_at timestamp without time zone
);


ALTER TABLE public.channel_messages OWNER TO fumi_042;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.channels (
    id uuid NOT NULL,
    server_id uuid NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    is_private boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    creator_id character varying(255),
    category_id uuid
);


ALTER TABLE public.channels OWNER TO fumi_042;

--
-- Name: chatbot_messages; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.chatbot_messages (
    id uuid NOT NULL,
    chat_id uuid NOT NULL,
    content text NOT NULL,
    role character varying(50) NOT NULL,
    "timestamp" timestamp without time zone NOT NULL
);


ALTER TABLE public.chatbot_messages OWNER TO fumi_042;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.chats (
    id uuid NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_message_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    message_count integer DEFAULT 0,
    user_id uuid NOT NULL
);


ALTER TABLE public.chats OWNER TO fumi_042;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    content text NOT NULL,
    role character varying(50),
    "timestamp" timestamp without time zone NOT NULL,
    chat_id uuid,
    channel_id uuid,
    user_id uuid,
    is_edited boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    edited_at timestamp without time zone
);


ALTER TABLE public.messages OWNER TO fumi_042;

--
-- Name: server_members; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.server_members (
    id uuid NOT NULL,
    server_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    joined_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.server_members OWNER TO fumi_042;

--
-- Name: servers; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.servers (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    owner_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.servers OWNER TO fumi_042;

--
-- Name: users; Type: TABLE; Schema: public; Owner: fumi_042
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO fumi_042;

--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.attachments (id, message_id, file_name, file_type, file_path, file_size, uploaded_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.categories (id, server_id, name, "position", created_at, updated_at) FROM stdin;
13d6a75c-7415-4dde-af8c-eecf83a4cf16	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	ゲーム	0	2025-03-08 17:19:24.989054	2025-03-08 17:19:24.989054
3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	あ	1	2025-03-08 17:19:24.989	2025-03-08 17:19:24.989
\.


--
-- Data for Name: channel_attachments; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.channel_attachments (id, message_id, file_name, file_type, file_path, file_size, uploaded_at) FROM stdin;
e204661f-9e3c-479d-82d2-640241c6ffe3	251c4130-3ca9-46ab-aa16-725726cf917f	551b0853-db86-4b2f-82b6-c2861b7adf74.png	image	uploads/551b0853-db86-4b2f-82b6-c2861b7adf74.png	291744	2025-03-08 14:51:00.429909
1631af68-7464-4def-a4b0-db714c2e5c27	08e64f76-8c1d-432d-9007-ea194bebeeba	28eab80e-edc2-4a40-b549-a160f68fccb7.png	image	uploads/28eab80e-edc2-4a40-b549-a160f68fccb7.png	291744	2025-03-08 15:00:29.646046
38e470e5-1632-494c-ac5f-a299d2559339	f8c785b9-33ab-4dd8-b74e-34d2ff0d0051	316dc40d-692a-48ea-8ee9-9607d1096589.png	image	uploads/316dc40d-692a-48ea-8ee9-9607d1096589.png	291744	2025-03-08 15:01:23.275324
022f9d0b-775f-4c50-8117-b556afe60c85	05ae1ac3-1673-41c5-88ce-dace4eb1f20c	3d1715a1-40d3-4de1-8551-260569ea2203.png	image	/uploads/3d1715a1-40d3-4de1-8551-260569ea2203.png	291744	2025-03-08 15:47:04.790223
f4d6756d-393d-4109-af15-1fc581fbbb9e	41d3dd52-6bee-429a-9e96-57b30cef0763	89f7e1d9-4469-4dd5-84ad-2ae36001c26d.jpg	image	/uploads/89f7e1d9-4469-4dd5-84ad-2ae36001c26d.jpg	43022	2025-03-08 15:52:56.371026
6d6cd19c-2814-40a4-8422-469d5c8185e2	621a11c3-9ff9-439d-bb67-733fe831a9d4	a8ec10f9-eb02-46ca-93b1-c801dd8206f0.jpg	image	/uploads/a8ec10f9-eb02-46ca-93b1-c801dd8206f0.jpg	43022	2025-03-08 15:53:46.951388
ee9c9e5d-0807-4104-8804-7882797e773d	9eee8a39-9251-423e-af5b-fbf9fd250e28	22de955a-e33a-4b1f-bed7-406054250375.jpg	image	/uploads/22de955a-e33a-4b1f-bed7-406054250375.jpg	43022	2025-03-08 16:02:17.03358
0532f9e5-4716-4366-8de1-5396279c059e	2f8818ee-fc08-4b39-9b11-c78cda252a29	c4c91623-9e9e-4f45-9c12-ee543e41ae3d.jpg	image	/uploads/c4c91623-9e9e-4f45-9c12-ee543e41ae3d.jpg	43022	2025-03-08 16:57:02.287196
aa2fcb17-214f-4d1c-8865-13a45d4beabd	2b2b2331-9b14-4043-83ff-915b3c4c692e	cc044c71-b57b-4af7-a31b-97342fe8925a.jpg	image	/uploads/cc044c71-b57b-4af7-a31b-97342fe8925a.jpg	43022	2025-03-08 18:20:19.054949
005a0ab9-e2b5-434f-a7ac-507a3c2a7107	47529e49-1c1f-4fab-b89f-6bdebba1fc47	f501bfba-97e6-4c47-b848-11a1328260f9.jpg	image	/uploads/f501bfba-97e6-4c47-b848-11a1328260f9.jpg	43022	2025-03-09 12:21:09.43803
\.


--
-- Data for Name: channel_members; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.channel_members (id, channel_id, user_id, added_at) FROM stdin;
\.


--
-- Data for Name: channel_messages; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.channel_messages (id, channel_id, user_id, content, "timestamp", is_edited, is_deleted, edited_at) FROM stdin;
78915acf-33c0-4e69-bf6a-18b8e53f80ed	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	こんにちは。更新します。	2025-03-08 23:17:25.743893	t	f	2025-03-08 14:21:35.561731
16aed26c-2ef2-4ec4-89f8-a4185b23d64a	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	添付します。	2025-03-08 23:28:42.303313	f	t	\N
043ffaf1-61b1-4514-8c93-129b40eb5581	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	画像をアップロード	2025-03-08 23:46:11.052934	f	t	\N
251c4130-3ca9-46ab-aa16-725726cf917f	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-08 23:51:00.429074	f	t	\N
fd38be27-536d-4a91-8222-71eac572de70	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	画像テスト	2025-03-08 23:51:00.36982	f	t	\N
08e64f76-8c1d-432d-9007-ea194bebeeba	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-09 00:00:29.645356	f	t	\N
27774097-a218-459f-956e-445a561083ce	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	アップロード	2025-03-09 00:00:29.584325	f	t	\N
f8c785b9-33ab-4dd8-b74e-34d2ff0d0051	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-09 00:01:23.274434	f	t	\N
08c2fbd7-daab-451f-bf5b-3325e5dcab3f	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	アップロード	2025-03-09 00:01:23.212071	f	t	\N
9424b5d0-35fb-4590-988f-cc6bee863343	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 00:11:48.401896	f	t	\N
852635b4-fd3c-46f9-bf3b-9c41a7762e15	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 00:11:03.464726	f	t	\N
842307d6-bf00-48b5-86f3-16fba9e68dbe	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	テスト	2025-03-09 00:15:55.03643	f	t	\N
cc2ba100-0ded-49c6-99db-e9e103cbe6a8	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	d	2025-03-09 00:17:48.314794	f	t	\N
252a7d7e-cef4-4789-8bb0-d9f4945c5169	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 00:10:46.863585	f	t	\N
df9e9569-aa2c-442b-91c8-1bbf39fdb3ae	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 00:31:02.308797	f	t	\N
f2a90b4b-f5fa-44e3-9e5a-c2afe043a4a9	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	画像	2025-03-09 00:31:19.028936	f	t	\N
10e52911-fd25-430d-89de-daf5d6d9ef31	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	ｓｓｓ	2025-03-09 00:39:55.366986	f	t	\N
decf0122-7293-4e5b-9505-2b1e7bcd4cf4	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	あｓｓ	2025-03-09 00:35:57.396712	f	t	\N
05ae1ac3-1673-41c5-88ce-dace4eb1f20c	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-09 00:47:04.789324	f	t	\N
be43b9b4-99fc-4bde-b81f-911c49258e2c	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	up	2025-03-09 00:47:04.703362	f	t	\N
f3b9d64a-8f48-4176-bcd9-566a8d9fdb7f	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 00:43:04.22316	f	t	\N
ec50d7f4-5ec2-4a00-aa9b-dfa87d3af5c9	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	s	2025-03-09 04:48:10.477686	f	t	\N
41d3dd52-6bee-429a-9e96-57b30cef0763	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	kawaii	2025-03-09 00:52:56.368523	t	t	2025-03-08 15:53:06.860081
621a11c3-9ff9-439d-bb67-733fe831a9d4	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-09 00:53:46.950306	f	t	\N
f3d5d99c-be60-4db6-88d7-a76776334fd1	a18cb30e-d112-4d04-b3ba-376ad5716aca	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	こんばんは	2025-03-09 01:14:42.940964	f	t	\N
9eee8a39-9251-423e-af5b-fbf9fd250e28	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	ああああああ	2025-03-09 01:02:17.030273	f	t	\N
2f8818ee-fc08-4b39-9b11-c78cda252a29	a18cb30e-d112-4d04-b3ba-376ad5716aca	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	dddd	2025-03-09 01:57:02.282561	f	t	\N
e5265554-1915-4a55-9f7e-e08f00f45f5a	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	あいうえお	2025-03-09 03:25:36.338473	f	f	\N
bb957dc8-7096-4742-bd07-0a629fb03e70	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	おつかれさまです。	2025-03-09 03:29:32.615999	f	f	\N
1c191271-1818-4249-ac93-a492e8575b38	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	おつかれさまです。	2025-03-09 03:31:44.852753	f	f	\N
268a9a6a-81e2-4a6a-98aa-db0ea46bc954	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ssssss	2025-03-09 04:21:32.209541	f	t	\N
b0759839-0b83-45c2-9280-2dcb63e29692	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ssss	2025-03-09 04:21:26.369906	f	t	\N
14b33b21-dd91-4234-98ab-348050b5ca73	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-09 04:14:48.327955	f	t	\N
2f5b5074-1a21-45af-86e7-ef3995641f13	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaaaasdf	2025-03-09 04:21:20.489985	f	t	\N
63fec993-d1c8-4d05-bfc6-2fdebbcbbf38	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	e	2025-03-09 04:10:56.255891	f	t	\N
929c7f75-d63c-4448-bf78-e7021278c8be	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	factorio	2025-03-09 04:14:35.307697	f	t	\N
1953b9c1-6b26-4ec5-937a-3097461358f5	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aiueo	2025-03-09 04:23:01.387935	f	t	\N
5c48eaad-2b77-45d7-ac04-e177e2d28364	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	う	2025-03-09 03:41:01.991141	f	t	\N
6a402554-9d10-4f9a-80a2-65d92876d0ec	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	い	2025-03-09 03:37:53.599761	f	t	\N
f8a6b0ed-9146-49b0-9a29-f347945db392	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-09 03:32:07.483111	f	t	\N
63f16184-ba89-418d-8cef-976b0fb5f0bf	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	dkdkdkdd	2025-03-09 04:26:48.721908	f	t	\N
9d5201b0-5a48-42f4-97c6-fcbc500d139a	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	fgh	2025-03-09 04:38:26.32849	f	t	\N
ce3dc12a-9497-434d-8b22-e1574bc761cc	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ffff	2025-03-09 04:46:57.357297	f	t	\N
c662b7d7-6262-437a-8ecb-c5a12d4e4fcf	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	asd	2025-03-09 04:36:53.811671	f	t	\N
52e15b37-c4cd-4731-9803-3f8f82d1dd86	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	sss	2025-03-09 04:25:14.813726	f	t	\N
e6dea3b7-0618-4402-b252-3929babb93e4	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aiueo	2025-03-09 04:23:19.926424	f	t	\N
cf25469f-ab72-4b4d-b32f-276916dee33b	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ttttttt	2025-03-09 04:53:43.374225	f	t	\N
03e10bba-0840-4ed3-aa9a-e82da5abc3f6	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaaaa	2025-03-09 04:47:50.175246	f	t	\N
1f5e9b5b-fc48-487f-b91d-3ccb01cfd7ee	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ddddd	2025-03-09 04:55:08.882603	f	f	\N
bfc067ad-abb0-4d5f-9134-4da7cf6db5fd	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ほげえええええ	2025-03-09 05:05:07.710792	f	t	\N
e938501c-520c-4e95-8ccf-f051a995429d	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ｗｗｗ	2025-03-09 05:07:25.494463	f	f	\N
2b2b2331-9b14-4043-83ff-915b3c4c692e	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	画像の添付	2025-03-09 03:20:19.051834	f	t	\N
47529e49-1c1f-4fab-b89f-6bdebba1fc47	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38		2025-03-09 21:21:09.412941	f	f	\N
910ae57e-92f2-418a-9c32-37beda58aa83	8dd31129-e929-4445-87ac-2a3702d4626c	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-09 15:13:00.69576	f	f	\N
8fbd68a6-8004-45e7-a340-d6ff054c4522	8dd31129-e929-4445-87ac-2a3702d4626c	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-09 15:13:07.616821	f	f	\N
05ea9011-165e-4bb5-82a8-a7e660e0719d	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-09 15:13:15.827941	f	f	\N
99a63a9a-5671-4d0b-a5ef-21cbc60f8898	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-09 15:13:21.581331	f	f	\N
711ee639-5b78-4969-8d56-8f9afdbdaf86	268d29ee-5a54-46f7-83d7-c7cf767fb959	df0b409e-1693-48af-aaae-ab54cf487c38	ｙ	2025-03-09 15:14:11.733396	f	f	\N
b153f525-179c-42d6-8aa3-63e5a6fd5283	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	あいうえお	2025-03-09 15:19:46.427185	f	f	\N
b76fd8b9-4c43-418f-84c5-d43d9c6d5afd	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	factorio	2025-03-09 15:21:33.24379	f	f	\N
f2615f94-23c1-48a8-8317-7f1979e27eb0	a10e916d-954d-4df3-a486-255a9138a2c2	df0b409e-1693-48af-aaae-ab54cf487c38	kgi	2025-03-09 15:29:28.808361	f	f	\N
c117ef30-e403-4ef8-bb2d-05c068644278	268d29ee-5a54-46f7-83d7-c7cf767fb959	df0b409e-1693-48af-aaae-ab54cf487c38	お疲れ様です	2025-03-09 15:37:49.570521	f	f	\N
8a58e032-7954-4d5d-9546-6db133ecffb4	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	あああ	2025-03-09 15:54:18.753882	f	f	\N
bf1ea6ee-4e9e-4a8d-a264-ecb28a84255f	268d29ee-5a54-46f7-83d7-c7cf767fb959	df0b409e-1693-48af-aaae-ab54cf487c38	ｊヵｆｄｊｌｋｊヵｆｄｓああ	2025-03-09 16:18:10.154022	f	f	\N
53c21575-3428-442b-b7a9-18f857172eec	6ecc88c9-6803-4424-bbb8-18fe9f6c7dbd	df0b409e-1693-48af-aaae-ab54cf487c38	https://www.monsterhunter.com/wilds/ja-jp/	2025-03-09 17:04:45.430699	f	f	\N
9707cdad-8fb4-4b81-b7ed-97d587e87d07	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	a	2025-03-10 01:45:22.594204	f	f	\N
2b055e70-c2d6-4281-b178-dee616a0a79c	8dd31129-e929-4445-87ac-2a3702d4626c	df0b409e-1693-48af-aaae-ab54cf487c38	i	2025-03-10 01:50:45.012172	f	f	\N
8459f1fe-94e0-4443-80ad-ec8061fdae29	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	s	2025-03-10 02:15:57.103228	f	f	\N
bf22b44a-2500-4802-a7f5-9f933701301c	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	ssssssssdff	2025-03-10 06:50:26.873999	f	f	\N
8ee9db8a-4691-40cb-b838-40323342b26d	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	a	2025-03-10 07:11:23.938842	f	f	\N
300ec62f-76cf-4bea-aecf-619d5b7fecd6	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	a	2025-03-10 07:11:26.661183	f	f	\N
931ea72a-7032-4546-acab-52670d7f8cc2	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	fdjljlafjl	2025-03-10 07:22:22.846286	f	f	\N
045f0c95-b258-4a15-924d-300f1bf3e216	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	ddddddd	2025-03-10 07:23:09.938685	f	f	\N
d7d1c282-b4be-4f00-9276-4554d12f40fe	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	s	2025-03-10 07:23:20.024176	f	f	\N
10fc9142-bd07-4e01-af2c-9fa177e0f2a8	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	sssssssssssssssssssssss	2025-03-10 07:27:45.277629	f	f	\N
ed02ad8d-3b7b-4624-bcba-c255e7283bca	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	vvvvvv	2025-03-10 07:28:31.206739	f	f	\N
3318a64d-4e73-4397-8800-b00efb516b16	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	ssssss	2025-03-10 07:33:51.472558	f	f	\N
f2358324-0117-43b6-943b-49e0da9116bb	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaaaifff	2025-03-11 05:59:39.665509	f	f	\N
c2d90f3c-9e69-49cd-a075-3e77cfae1b0e	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ddddddddd	2025-03-11 06:00:16.443292	f	f	\N
f10aa659-1cd8-47b3-8f8f-274ac5770ac2	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ssss	2025-03-11 06:02:49.140923	f	f	\N
59a91b53-6682-4eb1-b92a-e1b866c48e69	a18cb30e-d112-4d04-b3ba-376ad5716aca	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	sssssssss	2025-03-11 06:53:17.552536	f	f	\N
edc81501-6bd8-4ca2-b76a-f18bbe771e59	a18cb30e-d112-4d04-b3ba-376ad5716aca	df0b409e-1693-48af-aaae-ab54cf487c38	ｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓｓ	2025-03-11 06:53:21.653887	f	f	\N
4d4145f9-8c33-4982-8648-6d9f746952b2	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ああああああああああああ	2025-03-11 06:59:52.898323	f	f	\N
3ebf6d49-f2a3-4af4-987f-f823d4fadd3f	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	おつかれさまです。\n	2025-03-11 07:00:21.374464	f	f	\N
fda0a12a-dd97-40c2-a02b-0cf1f6c97eee	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ｓ\n	2025-03-11 07:01:29.677629	f	f	\N
92b907d0-e383-48e6-89ce-57dbdf3ca272	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ｄ	2025-03-11 07:01:50.851218	f	f	\N
1db7ec6e-644b-45f9-bd3b-690817968b9a	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	あいうえお	2025-03-11 07:03:32.388794	f	f	\N
9500abf1-008d-4736-81a8-bae31bb491b8	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	a	2025-03-12 01:46:51.353574	f	f	\N
a4ed9097-3652-4099-b41d-5f595da5ec25	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	お疲れ様です。	2025-03-12 01:47:03.396037	f	f	\N
53a08628-c1e2-4872-97dc-d8577e31eeb2	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	あ	2025-03-12 02:53:18.459494	f	f	\N
5614bfc2-319e-4819-b37c-fd2d0f18f764	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	iii	2025-03-12 02:53:27.921909	f	f	\N
c8450d2e-3a31-4a31-b648-e8d9d22eb091	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-12 07:35:16.637492	f	f	\N
c4aa4ece-5823-4e17-bad2-f9762f72886d	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	s	2025-03-12 07:37:10.614113	f	f	\N
2f4b1769-7901-46d5-a229-b0276295a319	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	s	2025-03-12 07:37:19.852966	f	f	\N
f28b71a0-fa5d-417b-ad29-40f0ac7b98fb	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	d	2025-03-12 07:39:11.845724	f	f	\N
74101ac5-03de-4090-9882-a42636a04fac	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	sss	2025-03-12 07:41:06.657302	f	f	\N
af3da8e2-bd3b-470a-938b-42935c2ea9ed	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	sss	2025-03-12 07:41:30.781142	f	f	\N
f8f160ce-7118-43ab-afe6-189afc497050	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	ssss	2025-03-12 07:45:28.05413	f	f	\N
1bcd2cfc-1e6b-4c25-b985-ad7a3849e940	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	sssssssssssss	2025-03-12 07:50:45.312955	f	f	\N
7703b782-4134-49f8-9dcb-f32768860023	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	bbb	2025-03-12 12:41:45.58065	f	f	\N
ffb1e3ec-5dbe-4188-82e7-dd4c25ef7abd	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	ccc	2025-03-12 12:45:02.822512	f	f	\N
df27371c-9bc5-45d8-8b4a-d8a9a732c952	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	saa	2025-03-12 16:04:10.486465	f	t	\N
ad182efe-828f-453b-884b-cadb817e559a	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	a	2025-03-12 15:28:35.912774	f	t	\N
145d5df9-3dfb-47c7-8d3a-0d01f76f249e	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	sss	2025-03-12 15:28:29.638523	f	t	\N
336f4cee-2a8e-4bf6-ace9-e42ac2597090	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aaa	2025-03-12 15:21:04.067637	f	t	\N
7c3f2aba-bb57-49e3-ada0-c12d65b0cbea	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	a	2025-03-12 15:15:27.541413	f	t	\N
f4bb6f65-66cd-4ec4-80a4-1a0013718216	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	a	2025-03-12 15:15:33.562129	f	t	\N
93259a89-f616-4ce1-8c7a-39a46cf452c1	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	aaaaaa	2025-03-12 15:10:39.546018	f	t	\N
b61c6d4a-0566-48fc-aee3-78c0b3f61e18	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	klfasjdlk	2025-03-12 15:10:31.886783	f	t	\N
7a2ce5f8-a633-4acd-a694-43f564cf8f18	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aa	2025-03-12 14:10:52.943626	f	t	\N
f44072ba-a438-4b13-9bdd-a67aa6b2a3fd	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	d	2025-03-12 14:06:58.769549	f	t	\N
4f1a1137-6b01-4279-94e3-818c4f68f818	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	d	2025-03-12 14:14:41.033012	f	t	\N
8bfa4ac5-7342-4c4d-aeb3-db801f41e782	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	z	2025-03-12 14:54:09.365362	f	t	\N
409e49f2-1cd2-4ad2-8929-e144848240d9	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	a	2025-03-12 14:52:29.392284	f	t	\N
42898bbf-409a-4c0a-bbfa-af33aeff1f97	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	a	2025-03-12 12:41:15.385642	f	t	\N
f860fc60-36b1-4aab-826b-17f5f51b4d2f	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	hoge	2025-03-12 14:06:20.121324	f	t	\N
2cebb94b-e560-4c88-92c0-fb42f1dd22ca	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	hoge	2025-03-12 14:06:31.716743	f	t	\N
20f66b3a-9996-49e5-ba38-d68cae186070	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	wwwwww	2025-03-12 14:06:02.829546	f	t	\N
2fda9fe1-c51a-49b9-9cc1-caf11c039b31	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	s	2025-03-12 14:05:48.728215	f	t	\N
e0a63a1f-6d37-476e-8b21-c14f9e96fa66	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	asdfhjkl	2025-03-12 12:54:56.701336	f	t	\N
a04cb924-3aae-4dd9-a132-a858de825295	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	kakikukeko	2025-03-12 12:50:32.598739	f	t	\N
c62cbc8b-67fd-4c59-b918-2c4b234fb154	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	aiueo	2025-03-12 12:49:33.053917	f	t	\N
3e50dfd2-c088-4adf-a0b7-e9df008b8e07	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	df0b409e-1693-48af-aaae-ab54cf487c38	df	2025-03-12 12:45:23.160407	f	t	\N
b6854051-32d1-45ff-b6fa-11b9db946d67	c6f85a18-70de-42c4-a2ac-9fb9a16a1570	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	cccc	2025-03-12 12:45:13.658794	f	t	\N
\.


--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.channels (id, server_id, name, description, is_private, created_at, updated_at, creator_id, category_id) FROM stdin;
6ecc88c9-6803-4424-bbb8-18fe9f6c7dbd	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	モンハン	モンハン	f	2025-03-09 15:47:48.829358	2025-03-09 15:47:48.829358	\N	13d6a75c-7415-4dde-af8c-eecf83a4cf16
8dd31129-e929-4445-87ac-2a3702d4626c	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	生成AI	AIを語るチャンネル	f	2025-03-08 17:38:32.652771	2025-03-08 17:38:32.652771	\N	3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60
a18cb30e-d112-4d04-b3ba-376ad5716aca	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	general	General discussion	f	2025-03-08 13:02:32.581945	2025-03-08 18:05:18.465827	df0b409e-1693-48af-aaae-ab54cf487c38	13d6a75c-7415-4dde-af8c-eecf83a4cf16
bf686b61-fbb6-4d52-b97c-0949fd6ec24f	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	あああ	あああ	f	2025-03-08 17:24:48.393273	2025-03-08 18:05:49.577539	\N	3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60
a10e916d-954d-4df3-a486-255a9138a2c2	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	テストチャンネル	これはテストチャンネル	f	2025-03-08 16:41:45.809247	2025-03-08 18:05:53.574789	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60
0157c864-49df-43ee-9f16-9f51407fe237	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	新しいチャンネル	新しいチャンネルを追加	f	2025-03-08 14:18:16.548727	2025-03-08 18:05:55.076249	df0b409e-1693-48af-aaae-ab54cf487c38	13d6a75c-7415-4dde-af8c-eecf83a4cf16
268d29ee-5a54-46f7-83d7-c7cf767fb959	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	マインクラフト	マインクラフトの情報を共有するチャンネル	f	2025-03-08 17:20:05.998544	2025-03-08 18:06:08.071756	\N	3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60
c6f85a18-70de-42c4-a2ac-9fb9a16a1570	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	factorio	ファクトリオ	f	2025-03-08 17:39:00.569816	2025-03-08 18:10:14.300964	\N	13d6a75c-7415-4dde-af8c-eecf83a4cf16
\.


--
-- Data for Name: chatbot_messages; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.chatbot_messages (id, chat_id, content, role, "timestamp") FROM stdin;
00e087fc-6c71-4472-b417-6d8502474818	02977034-40ce-44bf-9174-58eef0cd1e7f	こんにちは	user	2025-03-03 15:24:54.359166
03879070-99ad-431d-8f08-76de856a0c3c	02977034-40ce-44bf-9174-58eef0cd1e7f	こんにちは！お困りのことはありますか？お手伝いできることがあればお知らせください。	assistant	2025-03-03 15:24:55.657802
6bd42884-8ced-4606-b7ec-cb76d42dc077	af75772e-5c61-4132-ba42-3daefce86310	こんにちは	user	2025-03-04 10:38:42.274214
6be6b32c-b8ae-448e-aa4b-f05d04c92bea	af75772e-5c61-4132-ba42-3daefce86310	こんにちは！お困りのことはありますか？何か質問があればお気軽にどうぞ。	assistant	2025-03-04 10:38:43.961465
5c3c80eb-1abc-45b4-91a3-3e8566005b2d	984fa921-9a39-42b7-b885-fc3bdc6a6a69	ピカチュウ！	user	2025-03-04 10:54:07.444139
d17224bf-36f3-4f90-acf4-0795801b135d	984fa921-9a39-42b7-b885-fc3bdc6a6a69	ピカチュウは、ポケットモンスターシリーズに登場する電気タイプのポケモンですね！かわいい外見と電撃技で人気があります。	assistant	2025-03-04 10:54:09.199748
94fb88e1-b026-4ed2-bb44-b41bf1a29c8c	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	ワンピースという少年漫画について教えてください。	user	2025-03-04 14:53:44.93285
40e62907-efc3-4f87-b1cb-f2d5d1568ecd	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	『ワンピース』は、尾田栄一郎によって創作された人気の少年漫画です。主人公のモンキー・D・ルフィが海賊王を目指して仲間と共に冒険するストーリーが描かれています。海賊や悪党、海軍といった様々なキャラクターたちとの戦いや友情、成長が描かれており、多くの読者から支持を受けています。また、世界観や設定も独自の魅力があり、数々の伏線や謎を持つ作品として知られています。	assistant	2025-03-04 14:53:47.510622
22f369fb-b2ff-4c49-b24c-2f9431dbe9eb	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	現在エピソードはどこまで進んでいますか？	user	2025-03-04 15:17:37.493878
9b9280aa-fd8c-44f8-93b5-71b3c456ce2b	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	2021年12月時点での情報ですが、『ワンピース』のエピソードは第1000話を超えて進行しています。物語は引き続き進行中で、新たな展開や驚きが読者を楽しませています。最新のエピソードは常に週刊少年ジャンプなどで連載されているので、気になる方は最新の情報をチェックしてみてください。	assistant	2025-03-04 15:17:39.974112
b369effb-ab14-4dc6-b89e-33011727bab7	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	ありがとうございます。	user	2025-03-04 15:18:45.13274
a22ee42f-a0ab-478c-ad24-d9a82305fb57	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	どういたしまして。他に質問があればいつでもお知らせください。お手伝いいたします。	assistant	2025-03-04 15:18:46.011086
364c30a1-ec8f-481f-b246-609d205980eb	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	現在2025年3月4日なのですがどこまで進んでるかわかりますか？	user	2025-03-04 15:21:41.823112
7d0be9a3-4b64-41f6-ad36-fb77302eed97	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	申し訳ございませんが、私は2021年12月時点の情報しか持っておりません。最新の情報については公式の発表や情報源をご確認いただくか、インターネット上で検索していただくことをお勧めします。お手伝いできず申し訳ございません。	assistant	2025-03-04 15:21:43.633139
cafd24e6-296b-44ff-ae13-036b9bfa0cb1	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	2021年というとまだワノ国でしょうか？	user	2025-03-04 15:22:26.437157
b0e8d35d-e0aa-4046-9051-b1fe6eba54ce	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	2021年12月時点では、『ワンピース』のストーリーはワノ国編が進行していました。ワノ国編は、ルフィたちがワノ国に潜入し、大きな戦いが展開されるストーリーアークです。ワノ国編は長期にわたる大きなストーリーアークであり、多くの読者を魅了しました。最新の情報や進行状況については、公式の情報源や最新の話数をご確認ください。	assistant	2025-03-04 15:22:30.466152
505c3759-bb0f-4610-981c-8563d2719021	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	現在エピソードはどこまで進んでいますか？	user	2025-03-04 16:28:41.604453
12c5dc9f-0bda-427f-b4b3-75ca61a0077e	66d1f3b8-237c-4e4a-882a-68e5053dc2f9	2025年3月4日時点での『ワンピース』のエピソード数については具体的な情報をお伝えすることができません。最新の情報は公式の発表や情報源をご確認いただくか、インターネット上で検索していただくことをお勧めします。最新のエピソード数やストーリーの進行状況については公式の情報をご確認ください。	assistant	2025-03-04 16:28:45.029213
009f10a4-e478-4c6b-9297-2fd82581c2dc	d488c283-1425-4c22-8a28-eda065d87438	明日の東京の天気はわかりますか？	user	2025-03-04 16:29:24.550156
372d031e-6670-4baa-b3b6-c6f8afa2912f	d488c283-1425-4c22-8a28-eda065d87438	申し訳ありませんが、天気予報は私のデータベースにはありません。天気予報を知りたい場合は、インターネットや天気アプリなどで確認してください。	assistant	2025-03-04 16:29:26.004665
9f2185ae-e8ba-46e0-968f-cc69aec55e82	d488c283-1425-4c22-8a28-eda065d87438	Go言語でHelloWorldを表示させたいです。	user	2025-03-04 16:31:28.372394
d881d855-800f-4b76-a21a-e183df2ba574	d488c283-1425-4c22-8a28-eda065d87438	以下は、Go言語でHelloWorldを表示させるためのコード例です。\n\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n```\n\nこのコードをコンパイルして実行すると、コンソールに"Hello, World!"と表示されます。	assistant	2025-03-04 16:31:29.839359
f4c1b96a-2bc1-47b5-83d5-78441cd64f9f	d488c283-1425-4c22-8a28-eda065d87438	これはテストです\n\n```javascript\nconst hello = () => {\n  console.log("Hello, world!");\n};\n```	user	2025-03-04 16:43:30.016853
76bd8a9d-45e2-4097-bfd0-27ce213641e4	d488c283-1425-4c22-8a28-eda065d87438	これはJavaScriptでHello, World!を表示するコードですね。以下のコードを実行すると、コンソールに"Hello, world!"と表示されます。\n\n```javascript\nconst hello = () => {\n  console.log("Hello, world!");\n};\n\nhello(); // 関数を呼び出すことでメッセージが表示されます\n```\n\n関数を呼び出す `hello();` を追加することをお忘れなく。	assistant	2025-03-04 16:43:32.120606
9566ef1c-c1b5-42f0-95cf-81f4f19e650e	af75772e-5c61-4132-ba42-3daefce86310	2025年のAI事情はどうなると思いますか？	user	2025-03-09 15:52:20.127311
fafe3740-f839-45d9-a06d-6a9eb5f46818	af75772e-5c61-4132-ba42-3daefce86310	2025年にはAI技術がさらに進化し、様々な分野での活用が進むと予想されています。例えば、自動運転技術の普及、医療分野での診断支援、ロボットの活用などが進展すると考えられます。ただし、倫理的な問題やプライバシーの懸念も出てくる可能性があり、それらに対処するための取り組みも重要になるでしょう。	assistant	2025-03-09 15:52:22.418865
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.chats (id, title, created_at, last_message_at, message_count, user_id) FROM stdin;
02977034-40ce-44bf-9174-58eef0cd1e7f	こんにちは	2025-03-03 06:24:54.356302+00	2025-03-03 06:24:54.356302+00	2	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80
984fa921-9a39-42b7-b885-fc3bdc6a6a69	ピカチュウ！	2025-03-04 01:54:07.443225+00	2025-03-04 01:54:07.443225+00	2	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80
66d1f3b8-237c-4e4a-882a-68e5053dc2f9	ワンピースという少年漫画について教えてください。...	2025-03-04 05:53:44.929771+00	2025-03-04 07:28:41.589925+00	12	df0b409e-1693-48af-aaae-ab54cf487c38
d488c283-1425-4c22-8a28-eda065d87438	明日の東京の天気はわかりますか？...	2025-03-04 07:29:24.544379+00	2025-03-04 07:43:30.013638+00	6	df0b409e-1693-48af-aaae-ab54cf487c38
af75772e-5c61-4132-ba42-3daefce86310	こんにちは	2025-03-04 01:38:42.260522+00	2025-03-09 15:52:20.129572+00	2	df0b409e-1693-48af-aaae-ab54cf487c38
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.messages (id, content, role, "timestamp", chat_id, channel_id, user_id, is_edited, is_deleted, edited_at) FROM stdin;
\.


--
-- Data for Name: server_members; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.server_members (id, server_id, user_id, role, joined_at, updated_at) FROM stdin;
f3018537-c91e-434a-8306-a53979733172	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	df0b409e-1693-48af-aaae-ab54cf487c38	owner	2025-03-08 13:02:32.589367	2025-03-08 13:02:32.589367
3f7643fe-1d5a-b6a2-02d7-defb7c8b3b60	00f0ff8f-90f9-41fd-8b05-7439778f8b0a	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	member	2025-03-09 01:17:32.589	2025-03-09 01:17:32.589
\.


--
-- Data for Name: servers; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.servers (id, name, description, owner_id, created_at, updated_at) FROM stdin;
00f0ff8f-90f9-41fd-8b05-7439778f8b0a	テストサーバー	これはテスト用です。	df0b409e-1693-48af-aaae-ab54cf487c38	2025-03-08 13:02:32.559464	2025-03-08 13:02:32.559464
bafcc8a7-2687-4b0f-9984-0dfbf21818c9	testuser	テストユーザーが作ったサーバー	7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	2025-03-08 16:20:35.785999	2025-03-08 16:20:35.785999
a812682a-c115-4101-b294-b450cf8636c9	もうひとつのサーバ	fumi_042が作ったサーバ	df0b409e-1693-48af-aaae-ab54cf487c38	2025-03-08 16:47:47.047816	2025-03-08 16:47:47.047816
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fumi_042
--

COPY public.users (id, username, email, password, created_at, updated_at) FROM stdin;
7279d9d5-c47e-4d7a-9bd4-7364e6dcde80	testuser	test@example.com	$2a$10$hQjq7iWBkZ62NqzUX3oqNutO3dDnQgzBJtbKOTf2M4HTylUR/k3vq	2025-03-03 05:56:38.738758+00	2025-03-03 05:56:38.738758+00
df0b409e-1693-48af-aaae-ab54cf487c38	fumi_042	yoshifumi042@gmail.com	$2a$10$TxoMqs/rdbEqsTyhriRQA.KnFvuf3DOW2TZSPUoqVD13oKGNWgrmC	2025-03-03 06:58:57.964942+00	2025-03-03 06:58:57.964942+00
\.


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: channel_attachments channel_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_attachments
    ADD CONSTRAINT channel_attachments_pkey PRIMARY KEY (id);


--
-- Name: channel_members channel_members_channel_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_channel_id_user_id_key UNIQUE (channel_id, user_id);


--
-- Name: channel_members channel_members_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_pkey PRIMARY KEY (id);


--
-- Name: channel_messages channel_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_messages
    ADD CONSTRAINT channel_messages_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: chatbot_messages chatbot_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.chatbot_messages
    ADD CONSTRAINT chatbot_messages_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: server_members server_members_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.server_members
    ADD CONSTRAINT server_members_pkey PRIMARY KEY (id);


--
-- Name: server_members server_members_server_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.server_members
    ADD CONSTRAINT server_members_server_id_user_id_key UNIQUE (server_id, user_id);


--
-- Name: servers servers_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_attachments_message_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_attachments_message_id ON public.attachments USING btree (message_id);


--
-- Name: idx_channel_attachments_message_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_channel_attachments_message_id ON public.channel_attachments USING btree (message_id);


--
-- Name: idx_channel_messages_channel_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_channel_messages_channel_id ON public.channel_messages USING btree (channel_id);


--
-- Name: idx_channel_messages_user_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_channel_messages_user_id ON public.channel_messages USING btree (user_id);


--
-- Name: idx_chatbot_messages_chat_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_chatbot_messages_chat_id ON public.chatbot_messages USING btree (chat_id);


--
-- Name: idx_messages_channel_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_messages_channel_id ON public.messages USING btree (channel_id);


--
-- Name: idx_messages_chat_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_messages_chat_id ON public.messages USING btree (chat_id);


--
-- Name: idx_messages_user_id; Type: INDEX; Schema: public; Owner: fumi_042
--

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);


--
-- Name: attachments attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: categories categories_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: channel_attachments channel_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_attachments
    ADD CONSTRAINT channel_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.channel_messages(id) ON DELETE CASCADE;


--
-- Name: channel_members channel_members_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: channel_members channel_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channel_messages channel_messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_messages
    ADD CONSTRAINT channel_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: channel_messages channel_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channel_messages
    ADD CONSTRAINT channel_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channels channels_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: chatbot_messages chatbot_messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.chatbot_messages
    ADD CONSTRAINT chatbot_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chats chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channels fk_channels_category; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT fk_channels_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: server_members server_members_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.server_members
    ADD CONSTRAINT server_members_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: server_members server_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.server_members
    ADD CONSTRAINT server_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: servers servers_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fumi_042
--

ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

