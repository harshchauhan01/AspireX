document.addEventListener('DOMContentLoaded', function() {
    function updateDropdowns() {
        var recipientType = document.getElementById('id_recipient_type');
        var mentorField = document.querySelector('.form-row.field-mentor_id_field');
        var studentField = document.querySelector('.form-row.field-student_id_field');
        if (!recipientType || !mentorField || !studentField) return;
        if (recipientType.value === 'mentor') {
            mentorField.style.display = '';
            studentField.style.display = 'none';
        } else if (recipientType.value === 'student') {
            mentorField.style.display = 'none';
            studentField.style.display = '';
        } else {
            mentorField.style.display = 'none';
            studentField.style.display = 'none';
        }
    }
    var recipientType = document.getElementById('id_recipient_type');
    if (recipientType) {
        recipientType.addEventListener('change', updateDropdowns);
        updateDropdowns(); // Initial call
    }
}); 