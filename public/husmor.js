function store_task(task_name, task_point, user_email) {
  return $.ajax({
    url: "/husmor/store_task",
    type: "POST",
    data: {
      "task_name": task_name,
      "task_point": task_point,
      "user_email": user_email,
    },
    success: function() {
      location.reload();
    }
  });
}

function detailTask(task, owner, date, approval, id) {
  document.getElementById('detailTask').innerHTML = task;
  document.getElementById('detailOwner').innerHTML = owner;
  document.getElementById('detailDate').innerHTML = date;
  document.getElementById('detailApproval').innerHTML = approval;
  document.getElementById('detailId').innerHTML = id;
}

function approvedetailTask(task, owner, date, approval, id, task_points) {
  document.getElementById('approvedetailTask').innerHTML = task;
  document.getElementById('approvedetailOwner').innerHTML = owner;
  document.getElementById('approvedetailDate').innerHTML = date;
  document.getElementById('approvedetailApproval').innerHTML = approval;
  document.getElementById('approvedetailId').innerHTML = id;
  document.getElementById('approvedetailpoints').innerHTML = task_points;
}

function changeApprover(user) {
  return $.ajax({
    url: "/husmor/change_approver",
    type: "POST",
    data: {
      "user": user.toLowerCase(),
      "approver": document.getElementById('settings_approver').value.toLowerCase().replace(/ /g, ''),
    },
    success: function() {
      location.reload();
    }
  });
}

function approveTask() {
  return $.ajax({
    url: "/husmor/approve_task",
    type: "POST",
    data: {
      "usermail": document.getElementById('approvedetailOwner').innerHTML,
      "task_points": document.getElementById('approvedetailpoints').innerHTML,
      "id": document.getElementById('approvedetailId').innerHTML,
    },
    success: function() {
      location.reload();
    }
  });
}

function deleteTask() {
  return $.ajax({
    url: "/husmor/delete_task",
    type: "POST",
    data: {
      "id": document.getElementById('detailId').innerHTML,
    },
    success: function() {
      location.reload();
    }
  });
}


function resetScore(email) {
  return $.ajax({
    url: "/husmor/reset_score",
    type: "POST",
    data: {
      "email": email,
    },
    success: function() {
      location.reload();
    }
  });
}

function changepointlimit(email) {
  return $.ajax({
    url: "/husmor/change_point_limit",
    type: "POST",
    data: {
      "email": email,
      "limit": document.getElementById('change_point_limit').value,
    },
    success: function() {
      location.reload();
    }
  });
}

function load() {
  var userpoint = parseFloat(document.getElementById('user_points').innerHTML);
  var approverpoint = parseFloat(document.getElementById('approver_points').innerHTML);
  var totpoint = userpoint + approverpoint;
  var husmorfaktor = (Math.round((userpoint / totpoint) * 100)) / 100;

  var gaugeOptions = {

    chart: {
      type: 'solidgauge'
    },

    title: null,

    pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },

    tooltip: {
      enabled: false
    },

    // the value axis
    yAxis: {
      stops: [
        [0.1, '#55BF3B'], // green
      ],
      lineWidth: 0,
      minorTickInterval: null,
      tickPixelInterval: 400,
      tickWidth: 0,
      title: {
        y: -70
      },
      labels: {
        y: 16
      }
    },

    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true
        }
      }
    }
  };

  // The speed gauge
  $('#container-speed').highcharts(Highcharts.merge(gaugeOptions, {
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: 'Husmorfaktor'
      }
    },

    credits: {
      enabled: false
    },
    //user_points / approver_points
    series: [{
      name: 'Husmorfaktor',

      data: [husmorfaktor],
      dataLabels: {
        format: '<div style="text-align:center"><span style="font-size:25px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
          '<span style="font-size:12px;color:silver">faktor</span></div>'
      },
      tooltip: {
        valueSuffix: 'faktor'
      }
    }]

  }));
  // Bring life to the dials
  setTimeout(function() {
    // Speed
    var chart = $('#container-speed').highcharts(),
      point,
      newVal,
      inc;
  }, 2000);
}

function get_favorites() {
  return $.ajax({
    url: "/husmor/get_favorites",
    type: "POST",
    success: function(data) {
      var x = 1;
      for (k = 0; k < data.length; k += 1) {
        $('#house_favorites').append('<li>' + (k + 1) + '. ' + data[k].task_name + '<b> ' + data[k].count + '</b></li>');
        x += 1;
      }
    }
  });
}

function CreateHousehold(household_name, email) {
  //alert("Creating " + household_name);

  return $.ajax({
    url: "/husmor/createhousehold",
    type: "POST",
    data: {
      "description": household_name,
      "owner": email,
    },
    success: function(data) {
      alert(data);
    }
  });

}

function AddHouseholdMember(household_member, email) {
  //alert("Creating " + household_name);

  return $.ajax({
    url: "/husmor/addmember",
    type: "POST",
    data: {
      "new_member": household_member,
      "owner": email,
    },
    success: function(data) {
      alert(data);
    }
  });

}
