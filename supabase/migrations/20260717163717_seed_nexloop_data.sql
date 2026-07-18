/*
# NexLoop AI — Sample Seed Data

Inserts realistic sample data for demo purposes:
- Demo profiles (industry, municipality, citizen, admin)
- Waste listings across all 5 categories
- AI matches with confidence scores and CO2 impact
- Notifications, activity logs, reports

Note: These profiles are NOT linked to auth.users. They exist for
dashboard/analytics demo data. Real users created via signup will
have their own profile rows.
*/

INSERT INTO profiles (id, email, full_name, role, organization, city, country, circularity_score, total_diverted_kg, total_co2_saved_kg, total_matches, leaderboard_points)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'tata.steel@nexloop.ai', 'Rajesh Kumar', 'industry', 'Tata Steel Works', 'Jamshedpur', 'India', 87, 124500, 45200, 34, 8700),
  ('a0000000-0000-4000-8000-000000000002', 'reliance.petroleum@nexloop.ai', 'Priya Sharma', 'industry', 'Reliance Polymers Ltd', 'Jamnagar', 'India', 92, 198000, 71000, 52, 9200),
  ('a0000000-0000-4000-8000-000000000003', 'arvind.textiles@nexloop.ai', 'Arvind Desai', 'industry', 'Arvind Textile Mills', 'Ahmedabad', 'India', 78, 67000, 18900, 28, 7800),
  ('a0000000-0000-4000-8000-000000000004', 'mumbai.municipality@nexloop.ai', 'Sunita Patil', 'municipality', 'Mumbai Municipal Corporation', 'Mumbai', 'India', 81, 89000, 31200, 41, 8100),
  ('a0000000-0000-4000-8000-000000000005', 'delhi.municipality@nexloop.ai', 'Vikram Singh', 'municipality', 'Delhi Urban Services', 'New Delhi', 'India', 74, 56000, 19800, 23, 7400),
  ('a0000000-0000-4000-8000-000000000006', 'green.citizen@nexloop.ai', 'Meera Iyer', 'citizen', null, 'Bengaluru', 'India', 65, 3400, 1200, 12, 6500),
  ('a0000000-0000-4000-8000-000000000007', 'eco.citizen@nexloop.ai', 'Karan Mehta', 'citizen', null, 'Pune', 'India', 58, 2100, 850, 8, 5800),
  ('a0000000-0000-4000-8000-000000000008', 'admin@nexloop.ai', 'NexLoop Admin', 'administrator', 'NexLoop AI Platform', 'Bengaluru', 'India', 95, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Waste Listings
INSERT INTO waste_listings (id, owner_id, owner_name, owner_org, owner_role, title, description, category, material_subtype, quantity_kg, unit_price_per_kg, quality_grade, status, latitude, longitude, city, country)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Tata Steel Works', 'industry', 'Mild Steel Scrap — Turnings & Borings', 'Clean carbon steel turnings from CNC machining. Free of oil, rust, and non-ferrous contamination. Ideal for foundry re-melting.', 'scrap_metal', 'Mild Steel Turnings', 5000, 28, 'A', 'available', 22.8056, 86.2065, 'Jamshedpur', 'India'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Tata Steel Works', 'industry', 'Cast Iron Scrap — Mixed Grades', 'Mixed cast iron scrap from demolished equipment. Contains some machining chips. Suitable for cupola furnaces.', 'scrap_metal', 'Cast Iron', 3200, 22, 'B', 'matched', 22.8056, 86.2065, 'Jamshedpur', 'India'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Priya Sharma', 'Reliance Polymers Ltd', 'industry', 'HDPE Regrind — Natural Color', 'Post-industrial HDPE regrind from blown film trim. Natural/white color, no print. MFI 0.7. Ready for extrusion.', 'plastic', 'HDPE', 8000, 35, 'A', 'available', 22.4700, 69.9700, 'Jamnagar', 'India'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Priya Sharma', 'Reliance Polymers Ltd', 'industry', 'PP Off-Grade Pellets', 'Off-spec polypropylene pellets — slight color variation. Suitable for non-critical applications like crates, bins, automotive interiors.', 'plastic', 'Polypropylene', 12000, 42, 'B', 'available', 22.4700, 69.9700, 'Jamnagar', 'India'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'Arvind Desai', 'Arvind Textile Mills', 'industry', 'Cotton Fabric Offcuts — Denim', 'Pre-consumer denim cotton offcuts from garment cutting. Clean, no hardware. Ideal for insulation, stuffing, recycled yarn.', 'textile', 'Cotton Denim', 2500, 18, 'A', 'available', 23.0225, 72.5713, 'Ahmedabad', 'India'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Arvind Desai', 'Arvind Textile Mills', 'industry', 'Mixed Synthetic Fabric Waste', 'Polyester-cotton blend scraps. Mixed colors. Suitable for soundproofing panels, automotive carpet backing.', 'textile', 'Polyester Blend', 1800, 12, 'C', 'completed', 23.0225, 72.5713, 'Ahmedabad', 'India'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'Sunita Patil', 'Mumbai Municipal Corporation', 'municipality', 'E-Waste — Mixed Consumer Electronics', 'Collected e-waste from municipal drop-off points. Mixed TVs, CPUs, printers, small appliances. Needs sorting and dismantling.', 'e_waste', 'Mixed Electronics', 4500, 55, 'B', 'available', 19.0760, 72.8777, 'Mumbai', 'India'),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000004', 'Sunita Patil', 'Mumbai Municipal Corporation', 'municipality', 'Lithium-Ion Battery Packs — Spent', 'End-of-life Li-ion battery packs from EV swap stations. 60-70% residual capacity. Suitable for second-life energy storage.', 'e_waste', 'Li-Ion Batteries', 1200, 180, 'A', 'available', 19.0760, 72.8777, 'Mumbai', 'India'),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000005', 'Vikram Singh', 'Delhi Urban Services', 'municipality', 'Organic Food Waste — Restaurant Collection', 'Source-separated food waste from 200+ restaurants. Daily collection. Ideal for biogas plants or composting facilities.', 'food_agro', 'Food Waste', 15000, 5, 'B', 'available', 28.7041, 77.1025, 'New Delhi', 'India'),
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000005', 'Vikram Singh', 'Delhi Urban Services', 'municipality', 'Agricultural Crop Residue — Rice Husk', 'Rice husk from milling operations in NCR region. High silica content. Suitable for biofuel pellets, absorbents, cement additive.', 'food_agro', 'Rice Husk', 22000, 8, 'A', 'available', 28.7041, 77.1025, 'New Delhi', 'India'),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Tata Steel Works', 'industry', 'Stainless Steel 304 Scrap — Sheet Trim', '304-grade stainless sheet trim and offcuts. Clean, no contamination. High-value scrap for stainless re-melting.', 'scrap_metal', 'SS 304', 1800, 145, 'A', 'available', 22.8056, 86.2065, 'Jamshedpur', 'India'),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'Priya Sharma', 'Reliance Polymers Ltd', 'industry', 'PET Bottle Bales — Clear & Green', 'Post-consumer PET bottle bales, sorted clear and green. Washed, baled. Suitable for rPET flake production.', 'plastic', 'PET', 6000, 28, 'B', 'available', 22.4700, 69.9700, 'Jamnagar', 'India')
ON CONFLICT (id) DO NOTHING;

-- Matches
INSERT INTO matches (id, listing_id, listing_title, supplier_name, supplier_id, receiver_name, receiver_id, category, quantity_kg, recommended_price_per_kg, total_value, confidence, confidence_score, co2_saved_kg, landfill_diverted_kg, status, match_reason)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Cast Iron Scrap — Mixed Grades', 'Rajesh Kumar', 'a0000000-0000-4000-8000-000000000001', 'Bharat Foundry Castings', 'a0000000-0000-4000-8000-000000000003', 'scrap_metal', 3200, 24, 76800, 'high', 0.92, 5760, 3200, 'completed', 'Grade B cast iron matches foundry cupola feedstock requirements. Proximity 180km reduces logistics cost by 22%. Carbon steel equivalent production avoided.'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000006', 'Mixed Synthetic Fabric Waste', 'Arvind Desai', 'a0000000-0000-4000-8000-000000000003', 'AcousticTech Panels', 'a0000000-0000-4000-8000-000000000004', 'textile', 1800, 14, 25200, 'high', 0.88, 1620, 1800, 'completed', 'Polyester-cotton blend is ideal feedstock for acoustic panel core material. Absorption coefficient matches spec. Diverts 1.8T from landfill.'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'HDPE Regrind — Natural Color', 'Priya Sharma', 'a0000000-0000-4000-8000-000000000002', 'GreenPipe Manufacturing', 'a0000000-0000-4000-8000-000000000005', 'plastic', 8000, 36, 288000, 'high', 0.95, 9600, 8000, 'accepted', 'Post-industrial HDPE regrind meets pipe-grade spec. MFI and density match HDPE PE100. Eliminates need for virgin resin. 8T CO2 savings.'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000009', 'Organic Food Waste — Restaurant Collection', 'Vikram Singh', 'a0000000-0000-4000-8000-000000000005', 'BioGas Energy Solutions', 'a0000000-0000-4000-8000-000000000006', 'food_agro', 15000, 6, 90000, 'high', 0.91, 4500, 15000, 'pending', 'Daily food waste stream is ideal feedstock for anaerobic digestion. Estimated biogas yield: 120 m3/ton. 15T diverted from landfill monthly.'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000008', 'Lithium-Ion Battery Packs — Spent', 'Sunita Patil', 'a0000000-0000-4000-8000-000000000004', 'SecondLife Energy Storage', 'a0000000-0000-4000-8000-000000000007', 'e_waste', 1200, 185, 222000, 'medium', 0.76, 840, 1200, 'pending', '60-70% residual capacity suits stationary storage. Requires BMS reconfiguration. 1.2T Li-ion diverted — high environmental hazard avoided.'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000010', 'Agricultural Crop Residue — Rice Husk', 'Vikram Singh', 'a0000000-0000-4000-8000-000000000005', 'AgroPellet Biofuels', 'a0000000-0000-4000-8000-000000000001', 'food_agro', 22000, 9, 198000, 'high', 0.89, 6600, 22000, 'accepted', 'Rice husk high silica content ideal for biofuel pellets. Calorific value 14 MJ/kg. Prevents open-field burning — major air quality win for NCR.'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000012', 'PET Bottle Bales — Clear & Green', 'Priya Sharma', 'a0000000-0000-4000-8000-000000000002', 'rPet Fibers India', 'a0000000-0000-4000-8000-000000000003', 'plastic', 6000, 30, 180000, 'medium', 0.82, 4200, 6000, 'pending', 'Washed PET bales suitable for rPET flake then fiber extrusion. Some green contamination may require additional sorting. 6T plastic diverted.'),
  ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000011', 'Stainless Steel 304 Scrap — Sheet Trim', 'Rajesh Kumar', 'a0000000-0000-4000-8000-000000000001', 'Surya Stainless Re-rollers', 'a0000000-0000-4000-8000-000000000002', 'scrap_metal', 1800, 148, 266400, 'high', 0.94, 3600, 1800, 'in_transit', '304 SS trim is high-value feedstock for stainless re-rolling. Ni/Cr content matches spec. 1.8T high-grade alloy kept in circular loop.')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, read)
VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'New High-Confidence Match', 'AI found a 94% confidence match for your Stainless Steel 304 Scrap with Surya Stainless Re-rollers.', 'match', false),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Price Alert', 'Market price for SS 304 scrap has increased 4.2% this week. Consider listing now.', 'alert', false),
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Match Accepted', 'GreenPipe Manufacturing accepted your HDPE Regrind match. 8,000 kg in transit.', 'match', false),
  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'ESG Report Ready', 'Your Q3 2025 ESG sustainability report has been generated and is ready for download.', 'report', true),
  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', 'E-Waste Collection Scheduled', 'Pickup scheduled for 4,500 kg mixed e-waste from Andheri collection point on July 20.', 'system', false),
  ('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000005', 'Circularity Score Updated', 'Your municipality Circularity Score increased to 74 — a 6-point gain this quarter.', 'system', true)
ON CONFLICT (id) DO NOTHING;

-- Activity Logs
INSERT INTO activity_logs (id, user_id, user_name, action, detail, category)
VALUES
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Listing Created', 'Posted 5,000 kg Mild Steel Scrap — Turnings & Borings', 'scrap_metal'),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Priya Sharma', 'Match Accepted', 'Accepted HDPE Regrind match with GreenPipe Manufacturing (8,000 kg)', 'plastic'),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'Arvind Desai', 'Match Completed', 'Completed textile waste transfer to AcousticTech Panels (1,800 kg)', 'textile'),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'Sunita Patil', 'Listing Created', 'Posted 1,200 kg Lithium-Ion Battery Packs — Spent', 'e_waste'),
  ('e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'Vikram Singh', 'Match Pending', 'Food waste match pending with BioGas Energy Solutions (15,000 kg)', 'food_agro'),
  ('e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Report Generated', 'Generated Q3 2025 ESG sustainability report', 'report'),
  ('e0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'Priya Sharma', 'Listing Created', 'Posted 12,000 kg PP Off-Grade Pellets', 'plastic'),
  ('e0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000006', 'Meera Iyer', 'Bookmark Added', 'Bookmarked PET Bottle Bales listing', 'system')
ON CONFLICT (id) DO NOTHING;

-- Reports
INSERT INTO reports (id, user_id, title, report_type, period, summary, co2_saved_kg, waste_diverted_kg, circularity_score, matches_count)
VALUES
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Q3 2025 ESG Report — Tata Steel Works', 'esg', 'Q3 2025', 'Comprehensive ESG report covering 124,500 kg of waste diverted from landfill, 45,200 kg CO2 equivalent saved, and 34 successful industrial symbiosis matches across scrap metal and steel categories.', 45200, 124500, 87, 34),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Sustainability Impact — Reliance Polymers', 'sustainability', 'Q3 2025', 'Sustainability impact report for polymer waste recovery. 198,000 kg HDPE/PP/PET diverted. 71,000 kg CO2 saved. 52 matches completed across plastic recycling value chain.', 71000, 198000, 92, 52),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'Circularity Assessment — Mumbai Municipal', 'circularity', 'FY 2024-25', 'Circularity assessment for Mumbai municipal waste management. 89,000 kg e-waste and mixed materials diverted. 31,200 kg CO2 saved. Circularity score improved from 73 to 81.', 31200, 89000, 81, 41)
ON CONFLICT (id) DO NOTHING;
