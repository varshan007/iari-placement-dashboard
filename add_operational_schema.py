import re

with open('js/data.js', 'r') as f:
    content = f.read()

# We want to add fields just before the closing brace of each object
# The closing brace usually looks like:
#     strategicReason: "..."
#   },
# or
#     tags: [...]
#   },

# A better way is to find `id: "..."` and add it below that.
def replacer(match):
    id_val = match.group(1)
    return (f'id: "{id_val}",\n'
            f'    outreachStatus: "Not Contacted",\n'
            f'    lastContacted: null,\n'
            f'    nextFollowup: null,\n'
            f'    coordinator: "Unassigned",\n'
            f'    recruiterEmail: null,\n'
            f'    notes: "",\n'
            f'    outreachHistory: [],\n'
            f'    preferredDomains: [],')

new_content = re.sub(r'id:\s*"([^"]+)",', replacer, content)

with open('js/data.js', 'w') as f:
    f.write(new_content)
