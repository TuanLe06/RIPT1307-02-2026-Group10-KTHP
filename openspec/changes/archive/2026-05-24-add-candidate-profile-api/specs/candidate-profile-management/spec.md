## ADDED Requirements

### Requirement: Candidate can view personal profile
Há»‡ thá»‘ng SHALL cung cáº¥p API `GET /api/candidate/profile` Ä‘á»ƒ thÃ­ sinh Ä‘Ã£ Ä‘Äƒng nháº­p láº¥y há»“ sÆ¡ cÃ¡ nhÃ¢n tá»•ng há»£p tá»« `users` vÃ  `candidate_profiles`, vá»›i cáº¥u trÃºc response gá»“m `user` vÃ  `candidate_profile`.

#### Scenario: Get profile successfully
- **WHEN** thÃ­ sinh Ä‘Äƒng nháº­p há»£p lá»‡ gá»i `GET /api/candidate/profile`
- **THEN** há»‡ thá»‘ng tráº£ `200 OK` vá»›i dá»¯ liá»‡u cÃ³ 2 pháº§n `user` vÃ  `candidate_profile`

#### Scenario: Reject unauthenticated request
- **WHEN** client gá»i `GET /api/candidate/profile` mÃ  khÃ´ng cÃ³ token há»£p lá»‡
- **THEN** há»‡ thá»‘ng tráº£ `401 Unauthorized`

#### Scenario: Reject non-candidate role
- **WHEN** ngÆ°á»i dÃ¹ng cÃ³ role khÃ¡c `CANDIDATE` gá»i `GET /api/candidate/profile`
- **THEN** há»‡ thá»‘ng tráº£ `403 Forbidden`

#### Scenario: Candidate profile not found
- **WHEN** user cÃ³ role `CANDIDATE` nhÆ°ng chÆ°a cÃ³ báº£n ghi tÆ°Æ¡ng á»©ng trong `candidate_profiles`
- **THEN** há»‡ thá»‘ng tráº£ `404 Not Found` vá»›i thÃ´ng bÃ¡o há»“ sÆ¡ chÆ°a tá»“n táº¡i

### Requirement: Candidate can update personal profile
Há»‡ thá»‘ng SHALL cung cáº¥p API `PUT /api/candidate/profile` Ä‘á»ƒ thÃ­ sinh cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n theo whitelist trÆ°á»ng Ä‘Æ°á»£c phÃ©p, vá»›i `full_name` Ä‘Æ°á»£c lÆ°u chuáº©n táº¡i `candidate_profiles`.

#### Scenario: Update profile successfully
- **WHEN** thÃ­ sinh gá»­i `PUT /api/candidate/profile` vá»›i payload há»£p lá»‡
- **THEN** há»‡ thá»‘ng cáº­p nháº­t cÃ¡c trÆ°á»ng Ä‘Æ°á»£c phÃ©p vÃ  tráº£ `200 OK` vá»›i dá»¯ liá»‡u profile má»›i nháº¥t theo cáº¥u trÃºc `{ user, candidate_profile }`

#### Scenario: Update full_name in candidate profile
- **WHEN** payload cáº­p nháº­t cÃ³ thay Ä‘á»•i `full_name`
- **THEN** há»‡ thá»‘ng cáº­p nháº­t `candidate_profiles.full_name` vÃ  pháº£n há»“i dá»¯ liá»‡u má»›i nháº¥t tá»« nguá»“n chuáº©n nÃ y

#### Scenario: Reject invalid update payload
- **WHEN** thÃ­ sinh gá»­i `PUT /api/candidate/profile` vá»›i trÆ°á»ng khÃ´ng há»£p lá»‡ hoáº·c dá»¯ liá»‡u sai Ä‘á»‹nh dáº¡ng
- **THEN** há»‡ thá»‘ng tráº£ `400 Bad Request` kÃ¨m chi tiáº¿t lá»—i validation

#### Scenario: Reject unauthorized update request
- **WHEN** client gá»i `PUT /api/candidate/profile` mÃ  khÃ´ng cÃ³ token há»£p lá»‡ hoáº·c khÃ´ng pháº£i role `CANDIDATE`
- **THEN** há»‡ thá»‘ng tráº£ `401 Unauthorized` hoáº·c `403 Forbidden` tÆ°Æ¡ng á»©ng


