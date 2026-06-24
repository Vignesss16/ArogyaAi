import os
import re

filepath = 'c:/Users/dell/Desktop/ArogyaAI hackverse/AAROGYA-AI/hackx-main/hackx-auth-final/app/hospital/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Auth to use localStorage
# Find `const [auth, setAuth] = useState(false);`
auth_state = 'const [auth, setAuth] = useState(false);'
new_auth_state = '''const [auth, setAuth] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hospitalAuth") === "true";
    }
    return false;
  });'''
content = content.replace(auth_state, new_auth_state)

# Also update the login button actions to set localStorage
auth_check_1 = 'if (pass === "hospital123") setAuth(true);'
new_auth_check_1 = 'if (pass === "hospital123") { setAuth(true); localStorage.setItem("hospitalAuth", "true"); }'
content = content.replace(auth_check_1, new_auth_check_1)

# 2. Extract Emergencies Block and move it above Analytics Block
# The Emergencies block starts at: `{/* Emergencies */}`
# and ends right before `{/* Standard Wards */}`

emergencies_idx = content.find('{/* Emergencies */}')
wards_idx = content.find('{/* Standard Wards */}')
analytics_idx = content.find('{/* Right Column / Analytics */}')

if emergencies_idx != -1 and wards_idx != -1 and analytics_idx != -1:
    emergencies_block = content[emergencies_idx:wards_idx]
    
    # We remove the emergencies block from its original location
    before_emergencies = content[:emergencies_idx]
    after_wards = content[wards_idx:]
    content_without_emergencies = before_emergencies + after_wards
    
    # Now we find the new index of Analytics block in the modified content
    new_analytics_idx = content_without_emergencies.find('{/* Right Column / Analytics */}')
    
    # We insert the emergencies block right before Analytics block
    before_analytics = content_without_emergencies[:new_analytics_idx]
    after_analytics = content_without_emergencies[new_analytics_idx:]
    
    final_content = before_analytics + emergencies_block + '\n          ' + after_analytics
    content = final_content

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied successfully.")
