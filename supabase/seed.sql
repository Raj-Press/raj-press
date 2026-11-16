-- ==============================================================================
-- RAJ PRESS (राज प्रेस) - Production Seed Data (महाराष्ट्र प्रिंटिंग प्रेस सॅम्पल डेटा)
-- ==============================================================================

-- 1. Insert Initial Presets (कागद, साईज, बायडिंग, प्रिंटींग)
INSERT INTO public.presets (category, value) VALUES
    ('paper_primary', '70 GSM Maplitho (७० जीएसएम मॅपलिथो)'),
    ('paper_primary', '80 GSM Royal Executive Bond (८० जीएसएम बॉण्ड)'),
    ('paper_primary', '130 GSM Art Paper Gloss (१३० जीएसएम आर्ट पेपर)'),
    ('paper_primary', '170 GSM Art Card (१७० जीएसएम आर्ट कार्ड)'),
    ('paper_primary', '300 GSM Art Card (३०० जीएसएम कार्ड)'),
    ('paper_primary', '70 GSM Ledger Green Paper (७० जीएसएम लेजर वही कागद)'),
    ('paper_primary', '55 GSM Pink / Yellow Tint (५५ जीएसएम बिल बुक कॉपी)'),

    ('paper_size', '1/8 Demmy (८.५ x ५.५ इंच - 1/8 डेमी)'),
    ('paper_size', '1/4 Demmy (११ x ८.५ इंच - 1/4 डेमी)'),
    ('paper_size', '1/2 Demmy (१७ x ११ इंच - 1/2 डेमी)'),
    ('paper_size', 'A4 Size (८.२७ x ११.६९ इंच)'),
    ('paper_size', 'A5 Size (५.८ x ८.२७ इंच)'),
    ('paper_size', '12 x 18 Digital Sheet (१२ x १८ डिजिटल)'),
    ('paper_size', '13 x 19 Digital Sheet (१३ x १९ डिजिटल)'),

    ('binding_type', 'Hard Board Leather Rexine Binding (हार्ड बोर्ड लेदर रेक्झिन)'),
    ('binding_type', 'Center Pinning (सेंटर पिन)'),
    ('binding_type', 'Side Pin & Cloth Tape Binding (साईड पिन व पट्टी)'),
    ('binding_type', 'Spiral / Wiro Binding (स्पायरल बायडिंग)'),
    ('binding_type', 'Perfect Book Binding (परफेक्ट गम बायडिंग)'),
    ('binding_type', 'Pad Binding / Top Gumming (पॅड गमिंग)'),

    ('printing_type', 'Single Side Offset (सिंगल साईड ऑफसेट)'),
    ('printing_type', 'Double Side Offset (डबल साईड ऑफसेट)'),
    ('printing_type', 'Multicolour 4-Color Process (फोर कलर प्रोसेस)'),
    ('printing_type', 'Digital Laser Color (डिजिटल लेझर कलर)'),
    ('printing_type', 'Screen Printing (स्क्रीन प्रिंटींग)')
ON CONFLICT DO NOTHING;

-- 2. Insert Sample Parties (ग्राहक यादी)
INSERT INTO public.parties (id, name, phone, gst_no, address, total_billed, total_pending) VALUES
    ('11111111-1111-1111-1111-111111111111', 'श्री. आनंद कुलकर्णी (Kulkarni Traders)', '9822012345', '27AABCK1234F1Z5', 'मेन रोड, जुना बाजार, सोलापूर, महाराष्ट्र', 14500.00, 3500.00),
    ('22222222-2222-2222-2222-222222222222', 'देशमुख ॲग्रो एजन्सी (Deshmukh Agro)', '9423056789', '27AAECD5678G1Z1', 'मार्केट यार्ड, लातूर, महाराष्ट्र', 8200.00, 0.00),
    ('33333333-3333-3333-3333-333333333333', 'डॉ. सुहास जोशी (Joshi Hospital)', '9890123456', NULL, 'स्टेशन रोड, पुणे, महाराष्ट्र', 6400.00, 1400.00),
    ('44444444-4444-4444-4444-444444444444', 'माऊली मंगल कार्यालय (Mauli Mangal Karyalaya)', '9765432100', NULL, 'पंढरपूर बायपास, उस्मानाबाद, महाराष्ट्र', 19800.00, 6800.00)
ON CONFLICT DO NOTHING;

-- 3. Insert Realistic Orders (ऑर्डर लेजर)
INSERT INTO public.orders (
    id, receipt_no, order_date, party_id, party_name, party_phone,
    job_details, quantity, paper_primary, paper_secondary, paper_size,
    binding_type, ink_colours, printing_type, print_qty, numbering_range,
    total_amount, advance_amount, promise_date, status, notes
) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'RP-2026-0001',
        CURRENT_DATE - INTERVAL '3 days',
        '11111111-1111-1111-1111-111111111111',
        'श्री. आनंद कुलकर्णी (Kulkarni Traders)',
        '9822012345',
        'GST टॅक्स इन्व्हॉईस बिल बुक (3 प्रती - White/Pink/Yellow)',
        50,
        '70 GSM Maplitho (७० जीएसएम मॅपलिथो)',
        '55 GSM Pink / Yellow Tint (५५ जीएसएम बिल बुक कॉपी)',
        '1/4 Demmy (११ x ८.५ इंच - 1/4 डेमी)',
        'Side Pin & Cloth Tape Binding (साईड पिन व पट्टी)',
        ARRAY['Red', 'Black'],
        'Single Side Offset (सिंगल साईड ऑफसेट)',
        '50 पुस्तके x 100 पाने',
        '0001 ते 5000',
        9500.00,
        6000.00,
        CURRENT_DATE + INTERVAL '2 days',
        'Printing',
        'प्रूफ चेकिंग पूर्ण झाले आहे. लाल आणि काळा शाई कलर वापरावा.'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'RP-2026-0002',
        CURRENT_DATE - INTERVAL '2 days',
        '22222222-2222-2222-2222-222222222222',
        'देशमुख ॲग्रो एजन्सी (Deshmukh Agro)',
        '9423056789',
        'कंपनी लेटरहेड व व्हिजिटिंग कार्ड (Letterhead & Visiting Cards)',
        1000,
        '80 GSM Royal Executive Bond (८० जीएसएम बॉण्ड)',
        '300 GSM Art Card (३०० जीएसएम कार्ड)',
        'A4 Size (८.२७ x ११.६९ इंच)',
        'Pad Binding / Top Gumming (पॅड गमिंग)',
        ARRAY['Peacock-Blue', 'Black'],
        'Multicolour 4-Color Process (फोर कलर प्रोसेस)',
        '1000 लेटरहेड + 500 कार्ड',
        'नाही',
        8200.00,
        8200.00,
        CURRENT_DATE - INTERVAL '1 day',
        'Ready',
        'पॅकिंग करून डिस्पॅचसाठी तयार ठेवणे.'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'RP-2026-0003',
        CURRENT_DATE - INTERVAL '1 day',
        '33333333-3333-3333-3333-333333333333',
        'डॉ. सुहास जोशी (Joshi Hospital)',
        '9890123456',
        'ओपीडी प्रिस्क्रिप्शन पॅड्स (OPD Prescription Slips)',
        30,
        '70 GSM Maplitho (७० जीएसएम मॅपलिथो)',
        NULL,
        '1/8 Demmy (८.५ x ५.५ इंच - 1/8 डेमी)',
        'Pad Binding / Top Gumming (पॅड गमिंग)',
        ARRAY['Blue'],
        'Single Side Offset (सिंगल साईड ऑफसेट)',
        '30 पॅड x 100 पाने',
        'नाही',
        3400.00,
        2000.00,
        CURRENT_DATE + INTERVAL '1 day',
        'Binding',
        'टॉप गमिंग मजबूत करा.'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'RP-2026-0004',
        CURRENT_DATE,
        '44444444-4444-4444-4444-444444444444',
        'माऊली मंगल कार्यालय (Mauli Mangal Karyalaya)',
        '9765432100',
        'शाही लग्नपत्रिका व स्वागत लिफाफे (Royal Wedding Cards)',
        500,
        '300 GSM Art Card (३०० जीएसएम कार्ड)',
        NULL,
        '12 x 18 Digital Sheet (१२ x १८ डिजिटल)',
        'Center Pinning (सेंटर पिन)',
        ARRAY['Red', 'F/C'],
        'Multicolour 4-Color Process (फोर कलर प्रोसेस)',
        '500 संच',
        'नाही',
        19800.00,
        13000.00,
        CURRENT_DATE + INTERVAL '4 days',
        'Pending',
        'गोल्डन फॉईल व लाल मखमली फिनिशिंग.'
    )
ON CONFLICT DO NOTHING;
