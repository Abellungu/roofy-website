from flask import Flask, render_template, request, redirect, session, flash, url_for
import sqlite3

app = Flask(__name__)
app.secret_key = "secretkey"


# -------------------------
# DATABASE SETUP
# -------------------------
conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price TEXT,
    location TEXT,
    description TEXT,
    image TEXT,
    property_type TEXT
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT
)
""")


conn.commit()
conn.close()


# -------------------------
# HOME
# -------------------------
@app.route("/")
def index():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM properties ORDER BY id DESC LIMIT 3")
    properties = cursor.fetchall()

    conn.close()

    return render_template("index.html", properties=properties)


# -------------------------
# ADD PROPERTY
# -------------------------
@app.route("/add-property", methods=["GET", "POST"])
def add_property():
    if request.method == "POST":
        title = request.form.get("title")
        price = request.form.get("price")
        location = request.form.get("location")
        description = request.form.get("details")
        image = request.form.get("image")
        property_type = request.form.get("listing_type")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO properties (title, price, location, description, image, property_type)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, price, location, description, image, property_type))

        conn.commit()
        conn.close()

        return redirect("/listings")

    return render_template("add_property.html")


# -------------------------
# LISTINGS
# -------------------------

@app.route("/property/<int:id>")
def property_detail(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM properties WHERE id = ?", (id,))
    property = cursor.fetchone()

    conn.close()

    if property is None:
        return "Property not found"

    if property[5]:
        images = [img.strip() for img in property[5].split(",")]
    else:
        images = []

    return render_template("property.html", property=property, images=images)
@app.route("/listings")
def listings():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM properties")
    properties = cursor.fetchall()

    conn.close()

    return render_template("listings.html", properties=properties)


# -------------------------
# ADMIN PROPERTIES
# -------------------------
@app.route("/admin-properties")
def admin_properties():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM properties")
    properties = cursor.fetchall()

    conn.close()

    return render_template("admin_properties.html", properties=properties)


# -------------------------
# DELETE PROPERTY
# -------------------------
@app.route("/delete/<int:id>")
def delete(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM properties WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return redirect("/admin-properties")


# -------------------------
# RUN APP
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM properties WHERE id = ?", (id,))
    property = cursor.fetchone()

    if request.method == 'POST':
        title = request.form.get("title")
        price = request.form.get("price")
        location = request.form.get("location")
        type_ = request.form.get("type")

        cursor.execute("""
            UPDATE properties
            SET title=?, price=?, location=?, property_type=?
            WHERE id=?
        """, (title, price, location, type_, id))

        conn.commit()
        conn.close()

        flash("Property updated successfully!")

        return redirect("/admin-properties")

    # ✅ THIS PART WAS MISSING OR MISALIGNED
    conn.close()
    return render_template("edit_property.html", property=property)

@app.route("/led")
def led():
    return render_template("led.html")


from flask import request, redirect, render_template

@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
            (name, email, message)
        )

        conn.commit()
        conn.close()

        return redirect("/")

    return render_template("contact.html")


@app.route("/admin/messages")
def admin_messages():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row  # 👈 important (lets you use msg["name"])
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM messages ORDER BY id DESC")
    messages = cursor.fetchall()

    conn.close()

    return render_template("admin_messages.html", messages=messages)

@app.route('/admin/messages/delete/<int:id>', methods=['POST'])
def delete_message(id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("DELETE FROM messages WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return redirect(url_for('admin_messages'))

@app.route("/services")
def services():
    return render_template("services.html")
