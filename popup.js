// import { db, serverTimestamp } from './firebaseConfig.js';
// import { addDoc, collection } from "firebase/firestore";

// document.getElementById("bookmarkBtn").addEventListener("click", async () => {
//   const summary = document.getElementById("result").innerText;
//   const label = document.getElementById("labelInput").value.trim();
//   const url = await getCurrentTabUrl();

//   if (!summary || !label) {
//     alert("Enter label and generate summary first.");
//     return;
//   }

//   await addDoc(collection(db, "bookmarks"), {
//     summary,
//     label,
//     url,
//     createdAt: serverTimestamp()
//   });

//   alert("Bookmark saved!");
// });

// function getCurrentTabUrl() {
//   return new Promise((resolve) => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       resolve(tabs[0].url);
//     });
//   });
// }

// document.getElementById("summarize").addEventListener("click", () => {
//   // console.log("Summarize button is clicked");

//   const result = document.getElementById("result");

//   const summaryType = document.getElementById("summary-type").value;
//   result.innerHTML = '<div class="loader"></div>';

//   //Get the user API Key
//   chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
//     if (!geminiApiKey) {
//       result.textContent = "No API Key is set";
//       return;
//     }

//     //Ask content.js for the page text

//     chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//       chrome.tabs.sendMessage(
//         tab?.id,
//         { type: "GET_ARTICLE_TEXT" },
//         async ({ text }) => {
//           if (!text) {
//             result.textContent = "Could not extract text from page. ";
//             return;
//           }
//           //send text t Gemini

//           try {
//             const summary = await getGeminiSummary(
//               text,
//               summaryType,
//               geminiApiKey
//             );
//             result.textContent = summary;
//           } catch (error) {
//             result.textContent = "Gemini Error: " + error.message;
//           }
//         }
//       );
//     });
//   });
// });

// async function getGeminiSummary(RawText, summaryType, geminiApiKey) {
//   const max = 2000;
//   const text = RawText.length > max ? RawText.slice(0, max) + "..." : RawText;

//   const promptMap = {
//     brief: `Summarize in 2-3 sentences : \n\n${text}`,
//     detailed: `Give a detiled summary : \n\n${text}`,
//     bullets: `Summarize in 5-7 bullet points (start each line with "1.", "2.",etc only) : \n\n${text}`,
//   };

//   const prompt = promptMap[summaryType] || promptMap.brief;
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: { temperature: 0.2 },
//       }),
//     }
//   );

//   if (!res.ok) {
//     const { error } = await res.json();
//     throw new error(error?.message || "Request Failed");
//   }

//   const data = await res.json();
//   return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Summary";
// }

// document.getElementById("copy-btn").addEventListener("click", () => {
//   const summaryType = document.getElementById("result").innerText;

//   if (summaryType && summaryType.trim() !== "") {
//     navigator.clipboard
//       .writeText(summaryType)
//       .then(() => {
//         const copyBtn = document.getElementById("copy-btn");
//         const originalText = copyBtn.innerText;

//         copyBtn.innerText = "Copied!";
//         setTimeout(() => {
//           copyBtn.innerText = originalText;
//         }, 2000);
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//       });
//   }
// });

// // Show Bookmark button after summarization
// document.getElementById("summarize").addEventListener("click", () => {
//   const type = document.getElementById("summary-type").value;
//   const summaryText = `This is a ${type.toLowerCase()} summary of the webpage...`; // Replace with real summary logic

//   document.getElementById("result").innerText = summaryText;

//   // Show the bookmark button
//   document.getElementById("bookmarkToggleBtn").style.display = "inline-block";
// });

// // On clicking Bookmark button → show label input + Save
// document.getElementById("bookmarkToggleBtn").addEventListener("click", () => {
//   document.getElementById("bookmarkForm").style.display = "block";
// });

// // On clicking Save → save to Firebase
// document.getElementById("bookmarkBtn").addEventListener("click", async () => {
//   const summary = document.getElementById("summaryOutput").innerText.trim();
//   const label = document.getElementById("labelInput").value.trim();
//   const url = await getCurrentTabUrl();

//   if (!summary || !label) {
//     alert("Please enter a label.");
//     return;
//   }

//   const bookmark = {
//     summary,
//     label,
//     url,
//     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//   };

//   try {
//     await db.collection("bookmarks").add(bookmark);
//     alert("Bookmark saved!");
//     document.getElementById("labelInput").value = "";
//     document.getElementById("bookmarkForm").style.display = "none";
//   } catch (err) {
//     console.error("Bookmark error:", err);
//     alert("Error saving bookmark.");
//   }
// });

// // Utility: Get current page URL
// function getCurrentTabUrl() {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]) resolve(tabs[0].url);
//       else reject("No active tab found.");
//     });
//   });
// }

// Create or retrieve unique user ID
chrome.storage.sync.get(["userId"], (result) => {
  if (!result.userId) {
    const userId = "uid_" + Math.random().toString(36).substring(2, 10);
    chrome.storage.sync.set({ userId }, () => {
      console.log("✅ New userId created:", userId);
    });
  } else {
    console.log("✅ Existing userId:", result.userId);
  }
});

// Summarize
document.getElementById("summarize").addEventListener("click", () => {
  const result = document.getElementById("result");
  const summaryType = document.getElementById("summary-type").value;

  result.innerHTML = '<div class="loader"></div>';

  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      result.textContent =
        "❌ No API Key is set. Please set it in the options page.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text || res.text.trim().length < 50) {
            result.textContent = "❌ Could not extract text from page.";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              geminiApiKey
            );
            result.textContent = summary;
            showBookmarkSection();
            document.getElementById("bookmarkToggleBtn").style.display =
              "inline-block";
          } catch (err) {
            result.textContent = "❌ Gemini Error: " + err.message;
          }
        }
      );
    });
  });
});

async function getGeminiSummary(text, type, key) {
  const trimmed = text.length > 2000 ? text.slice(0, 2000) + "..." : text;

  const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${trimmed}`,
    detailed: `Give a detailed summary:\n\n${trimmed}`,
    bullets: `Summarize in 5-7 bullet points (start each line with 1., 2., etc.):\n\n${trimmed}`,
  };

  const prompt = promptMap[type] || promptMap.brief;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok)
    throw new Error((await res.json())?.error?.message || "Gemini API failed");

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "⚠️ No summary generated."
  );
}

// Copy summary
document.getElementById("copy-btn").addEventListener("click", () => {
  const summary = document.getElementById("result").innerText;
  if (!summary.trim()) return;

  navigator.clipboard.writeText(summary).then(() => {
    const btn = document.getElementById("copy-btn");
    const original = btn.innerText;
    btn.innerText = "Copied!";
    setTimeout(() => (btn.innerText = original), 2000);
  });
});

function showBookmarkSection() {
  document.getElementById("bookmarkToggleBtn").style.display = "inline-block";
}

document.getElementById("bookmarkToggleBtn").addEventListener("click", () => {
  document.getElementById("bookmarkForm").style.display = "block";
});

function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) resolve(tabs[0].url);
      else reject("❌ Could not get tab URL.");
    });
  });
}

// Bookmark Save
document.getElementById("bookmarkBtn").addEventListener("click", async () => {
  const summary = document.getElementById("result").innerText.trim();
  const label = document.getElementById("labelInput").value.trim();
  if (!summary || !label)
    return alert("⚠️ Enter a label and generate summary.");

  const url = await getCurrentTabUrl();

  chrome.storage.sync.get(["userId"], async ({ userId }) => {
    if (!userId) return alert("❌ User ID missing.");

    try {
      await firebase.firestore().collection("bookmarks").add({
        summary,
        label,
        url,
        userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      alert("✅ Bookmark saved!");
      document.getElementById("labelInput").value = "";
      document.getElementById("bookmarkForm").style.display = "none";
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Bookmark save failed.");
    }
  });
});
// Cancel bookmark button
document.getElementById("cancelBookmarkBtn").addEventListener("click", () => {
  document.getElementById("labelInput").value = "";
  document.getElementById("bookmarkForm").style.display = "none";
});

// Load bookmarks
let bookmarksVisible = false; // toggle state tracker

document.getElementById("loadBookmarksBtn").addEventListener("click", () => {
  const btn = document.getElementById("loadBookmarksBtn");
  const listEl = document.getElementById("bookmarksList");

  // If currently visible, close it
  if (bookmarksVisible) {
    listEl.innerHTML = "";
    btn.textContent = "📑 View Bookmarks";
    bookmarksVisible = false;
    return;
  }

  // Show loading state
  listEl.innerHTML = '<div class="loader"></div>';
  btn.textContent = "❌ Close Bookmarks";

  chrome.storage.sync.get(["userId"], async ({ userId }) => {
    if (!userId) {
      listEl.innerHTML = "<p>User ID missing.</p>";
      return;
    }

    try {
      const snapshot = await db
        .collection("bookmarks")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      if (snapshot.empty) {
        listEl.innerHTML = "<p>No bookmarks found.</p>";
        return;
      }

      const grouped = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        data._docId = doc.id; // Store doc ID for deletion
        if (!grouped[data.label]) {
          grouped[data.label] = [];
        }
        grouped[data.label].push(data);
      });

      let html = `<h3>Your Bookmarks:</h3>`;
      for (const label in grouped) {
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <div class="label-link" data-label="${label}" style="cursor:pointer; color:#28a745; text-decoration:underline;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" stroke="#28a745" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:5px;">
                <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z"/>
              </svg>
              ${label}
            </div>
            <button class="delete-btn" data-label="${label}" style="background:none; border:none; cursor:pointer;" title="Delete ${label}">
              🗑️
            </button>
          </div>
        `;
      }

      listEl.innerHTML = html;
      window.groupedBookmarks = grouped;
      bookmarksVisible = true;

      // Add click handlers
      document.querySelectorAll(".label-link").forEach((el) => {
        el.addEventListener("click", () => {
          const label = el.dataset.label;
          showBookmark(label);
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const label = btn.dataset.label;
          const confirmDelete = confirm(
            `Delete all bookmarks under "${label}"?`
          );
          if (!confirmDelete) return;

          const entries = grouped[label];
          const deletePromises = entries.map((entry) =>
            db.collection("bookmarks").doc(entry._docId).delete()
          );

          try {
            await Promise.all(deletePromises);
            alert(`✅ Deleted bookmarks for "${label}"`);
            document.getElementById("loadBookmarksBtn").click(); // reload
          } catch (err) {
            console.error("❌ Delete error:", err);
            alert("❌ Failed to delete.");
          }
        });
      });
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      listEl.innerHTML = "<p>Failed to load bookmarks.</p>";
    }
  });
});

//function
function renderLabelList() {
  const listEl = document.getElementById("bookmarksList");
  const grouped = window.groupedBookmarks;

  if (!grouped || Object.keys(grouped).length === 0) {
    listEl.innerHTML = "<p>No bookmarks found.</p>";
    return;
  }

  let html = `<h3>Your Bookmarks:</h3>`;
  for (const label in grouped) {
    html += `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <div class="label-link" data-label="${label}" style="cursor:pointer; color:#28a745; text-decoration:underline;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" stroke="#28a745" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:5px;">
            <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z"/>
          </svg>
          ${label}
        </div>
        <button class="delete-btn" data-label="${label}" style="background:none; border:none; cursor:pointer;" title="Delete ${label}">
          🗑️
        </button>
      </div>
    `;
  }

  listEl.innerHTML = html;

  // Reattach click listeners
  document.querySelectorAll(".label-link").forEach((el) => {
    el.addEventListener("click", () => {
      const label = el.dataset.label;
      showBookmark(label);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const label = btn.dataset.label;
      const confirmDelete = confirm(`Delete all bookmarks under "${label}"?`);
      if (!confirmDelete) return;

      const entries = grouped[label];
      const deletePromises = entries.map((entry) =>
        db.collection("bookmarks").doc(entry._docId).delete()
      );

      try {
        await Promise.all(deletePromises);
        alert(`✅ Deleted "${label}"`);
        delete grouped[label]; // Remove locally
        renderLabelList(); // Refresh label list
      } catch (err) {
        console.error("Delete failed:", err);
        alert("❌ Failed to delete bookmarks.");
      }
    });
  });
}

// Function to display bookmarks under a label with close button
window.showBookmark = (label) => {
  const listEl = document.getElementById("bookmarksList");
  const entries = window.groupedBookmarks[label];

  if (!entries || entries.length === 0) {
    listEl.innerHTML = "<p>No entries found for this label.</p>";
    return;
  }

  // Header section with label and close
  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
      <h4 style="margin: 0;">Bookmarks for <strong>${label}</strong></h4>
      <button id="closeBookmarkView" title="Close" style="font-size:16px; background:none; border:none; cursor:pointer;">❌</button>
    </div>
  `;

  // Add bookmark entries
  entries.forEach((entry) => {
    html += `
      <div style="margin-bottom: 10px;">
        <a href="${
          entry.url
        }" target="_blank" style="font-size:13px; color:blue;">🔗 Visit Page</a>
        <p style="font-size: 12px;">${entry.summary.slice(0, 150)}...</p>
      </div>
    `;
  });

  listEl.innerHTML = html;

  // ✅ Close button goes back to main label list view
  document
    .getElementById("closeBookmarkView")
    .addEventListener("click", renderLabelList);
};
